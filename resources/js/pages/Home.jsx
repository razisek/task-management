import React, { useState, useEffect } from 'react'
import { BsTrash, BsPencil, BsEye, BsPlusLg } from "react-icons/bs";

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [titleTask, setTitleTask] = useState('');
    const [descriptionTask, setDescriptionTask] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState('Pending');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const addTask = () => {
        if (titleTask.trim() !== '') {
            setTasks([...tasks, {
                id: Date.now(),
                title: titleTask,
                description: descriptionTask,
                deadline: deadline,
                status: status,
                file: file
            }]);
            setTitleTask('');
            setDescriptionTask('');
            setFile(null);
            setPreviewUrl(null);
            setIsPopupOpen(false);
        }
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const startEditing = (task) => {
        setEditingTask(task);
        setTitleTask(task.title);
        setDescriptionTask(task.description);
        setDeadline(task.deadline);
        setStatus(task.status);
        setFile(task.file);
        setPreviewUrl(task.file ? URL.createObjectURL(task.file) : null);
        setIsPopupOpen(true);
    };

    const saveEdit = () => {
        setTasks(tasks.map(task =>
            task.id === editingTask.id ? {
                ...task,
                title: titleTask,
                description: descriptionTask,
                deadline: deadline,
                status: status,
                file: file
            } : task
        ));
        setEditingTask(null);
        setTitleTask('');
        setFile(null);
        setPreviewUrl(null);
        setIsPopupOpen(false);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            alert('Please select a PDF file.');
            setFile(null);
            setPreviewUrl(null);
        }
    };

    return (
        <div className="p-4 bg-gray-100 h-screen w-full">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Task Management System</h1>

                <div className="mb-6">
                    <button
                        onClick={() => { setIsPopupOpen(true); setEditingTask(null); setTitleTask(''); setFile(null); setPreviewUrl(null); }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        <BsPlusLg className="inline-block mr-2" size={16} />
                        Add New Task
                    </button>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Task
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Deadline
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.map((task, index) => (
                                <tr key={task.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{task.deadline}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{task.status}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {task.file && (
                                            <button
                                                onClick={() => window.open(URL.createObjectURL(task.file), '_blank')}
                                                className="text-blue-600 hover:text-blue-900 mr-3 transition duration-300 ease-in-out"
                                            >
                                                <BsEye className="inline-block mr-1" size={18} />
                                                View
                                            </button>
                                        )}
                                        <button
                                            onClick={() => startEditing(task)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3 transition duration-300 ease-in-out"
                                        >
                                            <BsPencil className="inline-block mr-1" size={18} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="text-red-600 hover:text-red-900 transition duration-300 ease-in-out"
                                        >
                                            <BsTrash className="inline-block mr-1" size={18} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="relative p-8 bg-white w-full max-w-2xl m-4 rounded-xl shadow-2xl">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                value={titleTask}
                                onChange={(e) => setTitleTask(e.target.value)}
                                placeholder="Enter task title"
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            />
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={descriptionTask}
                                onChange={(e) => setDescriptionTask(e.target.value)}
                                placeholder="Enter task description"
                                rows="5"
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            />
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="deadline">Deadline</label>
                            <input
                                id="deadline"
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            />
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">Status</label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
                                    Attach PDF
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            {previewUrl && (
                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-700">PDF Preview:</h4>
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-64 border border-gray-300 rounded-lg"
                                        title="PDF Preview"
                                    ></iframe>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    onClick={editingTask ? saveEdit : addTask}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mr-2 transition duration-300 ease-in-out"
                                >
                                    {editingTask ? 'Save Changes' : 'Add Task'}
                                </button>
                                <button
                                    onClick={() => { setIsPopupOpen(false); setPreviewUrl(null); }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

export default Home