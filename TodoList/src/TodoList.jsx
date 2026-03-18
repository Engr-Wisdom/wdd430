import React, { useEffect, useState } from 'react'

const TodoList = () => {
    const [name, setName] = useState("")
    const [date, setDate] = useState()
    const [task, setTask] = useState(() => {
        const saved = localStorage.getItem("task")
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem("task", JSON.stringify(task))
    }, [task])

    useEffect(() => {
        const savedItem = localStorage.getItem("task")
        savedItem && JSON.parse(savedItem)
    }, [])

    const toggleComplete = (index) => {
        setTask(prev => (
            prev.map((task, i) => (
                i === index ? {...task, complete: !task.complete} : task
            ))
        ))
    }

    return (
        <div className='bg-gray-800 w-2xl m-auto mt-5 rounded p-8'>
        <h1 className='text-white text-center text-2xl font-medium'>Todo List</h1>

        <form className='grid grid-cols-[3fr_2fr_1fr] gap-2 mt-5' onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder='Enter item name' className='border text-white px-2 py-1 
            rounded outline-none' onChange={(e) => setName(e.target.value)}/>
            <input type="date" className='border text-white outline-none rounded px-2' onChange={(e) => setDate(e.target.value)}/>
            <button type='submit' className='text-white bg-green-700 rounded font-medium cursor-pointer' onClick={() => {
                {name !== "" && date !== "" && setTask(prev => [...prev, {name, date, complete: false}])}
            }}>Add</button>
        </form>

        <div className='mt-5'>
            {task.length === 0 && <h2 className='text-white text-center'>No item found</h2>}            
            <ul>
                {task.map((task, index) => (
                    <li key={index} className='grid grid-cols-[0.2fr_3fr_2fr_1fr] items-center gap-2 text-white mt-2'>
                        <input type="checkbox" checked={task.complete} onChange={() => toggleComplete(index)}/>
                        <span>{task.name}</span>
                        <span>{task.date}</span>
                        <button className='bg-red-800 rounded py-1 cursor-pointer' onClick={() => {
                            setTask(task => task.filter((_, i) => i !== index))
                        }}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
        </div>
    )
}

export default TodoList
