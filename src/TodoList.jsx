import React, { useState, useEffect } from 'react'

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
        const savedTask = localStorage.getItem("task")
        savedTask && JSON.parse(savedTask);
    }, [])

  return (
    <div className='bg-gray-800 w-2xl m-auto mt-5 p-5 rounded'>
      <h1 className='text-white text-2xl font-medium text-center mb-5'>Todo List</h1>
      <form className='grid grid-cols-[3fr_2fr_1fr] gap-2' onSubmit={(e) => {
        e.preventDefault()
      }}>
        <input type="text" name="name" placeholder='Enter item name' className='border rounded px-2 py-1 
        outline-none text-white' onChange={(e) => setName(e.target.value)}/>
        
        <input type="date" name="date" className='text-white border rounded px-2' onChange={(e) => {
            setDate(e.target.value)
        }}/>

        <button type="submit" className='bg-green-700 rounded text-white font-medium cursor-pointer'
        onClick={() =>{
            name !== "" && date !== "" && setTask(task => [...task, {name, date}])
            }}>Add</button>
      </form>

      <div>
        {task.length === 0 && <h2 className='text-center text-white mt-5'>No item found</h2>}
        <ul>
            {task.map((task, index) => (
                <li key={index} className='mt-2 grid grid-cols-[0.2fr_3fr_2fr_1fr] gap-2 text-white text-md items-center'>
                    <input type="checkbox" />
                    <span>{task.name}</span> 
                    <span>{task.date}</span>
                    <button className='bg-red-800 rounded py-1 cursor-pointer' onClick={() => {
                        setTask(prev => prev.filter((_, i) => i !== index))
                    }}>Delete</button>
                </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

export default TodoList
