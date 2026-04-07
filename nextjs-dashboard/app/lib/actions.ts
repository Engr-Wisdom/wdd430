"use server"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import postgres from "postgres"
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" })

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

const CreateInvoice = FormSchema.omit({ id: true, date: true })

export async function createInvoice(prevState: State,  formData: FormData) {
    try {
        // Validate form data
        const validatedFields = CreateInvoice.safeParse({
            customerId: formData.get("customerId"),
            amount: formData.get("amount"),
            status: formData.get("status")
        });

        // Return early if validation fails
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing fields. Failed to Create Invoice.',
            };
        }

        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;
        const date = new Date().toISOString().split("T")[0]

        // Check if customer exists (optional but recommended)
        const customer = await sql`
            SELECT id FROM customers WHERE id = ${customerId}
        `;
        
        if (customer.length === 0) {
            return {
                message: 'Customer does not exist.',
            };
        }

        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;

        revalidatePath("/dashboard/invoices")
        redirect("/dashboard/invoices")
        
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to create invoice.',
        };
    }
}

const UpdateInvoiceSchema = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    try {
        const validatedFields = UpdateInvoiceSchema.safeParse({
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status'),
        });

        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing or invalid fields. Failed to update invoice.',
            };
        }

        const { customerId, amount, status } = validatedFields.data;
        const amountInCents = amount * 100;

        // Check if invoice exists before updating
        const existingInvoice = await sql`
            SELECT id FROM invoices WHERE id = ${id}
        `;
        
        if (existingInvoice.length === 0) {
            return {
                message: 'Invoice not found.',
            };
        }

        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;

        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
        
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to update invoice.',
        };
    }
}

export async function deleteInvoice(id: string) {
    try {
        // Validate id
        if (!id) {
            return {
                message: 'Invoice ID is required.',
            };
        }

        // Check if invoice exists before deleting
        const existingInvoice = await sql`
            SELECT id FROM invoices WHERE id = ${id}
        `;
        
        if (existingInvoice.length === 0) {
            return {
                message: 'Invoice not found.',
            };
        }

        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        
        return { message: 'Invoice deleted successfully.' };
        
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Database Error: Failed to delete invoice.',
        };
    }
}