import React, { useState, useEffect } from 'react'
import { BsTrash, BsPencil, BsEye, BsPlusLg } from "react-icons/bs";
import Alert from '../components/Alert';
import api from '../Api/api';

const Home = () => {
    const [tasks, setTasks] = useState([]);
    const [titleTask, setTitleTask] = useState('');
    const [descriptionTask, setDescriptionTask] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState('pending');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [detailPopup, setDetailPopup] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // reordering tasks based on status
    const showTask = (tasks) => {
        const statusOrder = {
            "pending": 1,
            "in_progress": 2,
            "completed": 3
        };

        tasks.sort((a, b) => {
            return statusOrder[a.status] - statusOrder[b.status];
        });

        setTasks(tasks);
    };

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            await api.get('/tasks').then(response => {
                showTask(response.data.data);
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();

        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Add a new task
    const addTask = () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('title', titleTask);
        formData.append('description', descriptionTask);
        formData.append('deadline', deadline);
        formData.append('status', status);
        if (file) {
            formData.append('attachment_url', file);
        }

        try {
            api.post('/tasks', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(response => {
                setLoading(false);
                setSuccess('Task added successfully.');
                setError(null);
                setTitleTask('');
                setDescriptionTask('');
                setFile(null);
                setTimeout(() => {
                    fetchTasks();
                    setIsPopupOpen(false);
                    setSuccess(null);
                }, 2000);
            }).catch(error => {
                setLoading(false);
                if (error.response && error.response.status === 422) {
                    if (error.response.data.errors.title) {
                        setError(error.response.data.errors.title[0]);
                    } else if (error.response.data.errors.status) {
                        setError(error.response.data.errors.status[0]);
                    } else if (error.response.data.errors.deadline) {
                        setError(error.response.data.errors.deadline[0]);
                    } else if (error.response.data.errors.attachment_url) {
                        setError(error.response.data.errors.attachment_url[0]);
                    } else {
                        setError('Check your form inputs.');
                    }
                } else {
                    setError('An error occurred. Please try again.');
                }
            });;
        } catch (error) {
            setLoading(false);
            setSuccess(null);
            setError('An error occurred. Please try again.');
        }
    };

    // Get the file preview
    const getFilePreview = async (id) => {
        return await api.get(`/tasks/${id}/preview`, {
            responseType: 'blob',
        }).then(response => {
            if (response.data) {
                return response.data;
            } else {
                return null;
            }
        }).catch(error => {
            if (error.response.status !== 200) {
                return null;
            }
        });
    };

    // show popup to view task detail
    const detailTask = (task) => {
        const dateFormated = new Date(task.deadline).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        });
        setDetailPopup(true);
        setTitleTask(task.title);
        setStatus(task.status);
        setDescriptionTask(task.description);
        setDeadline(dateFormated);
        getFilePreview(task.id).then(file => setPreviewUrl(file ? URL.createObjectURL(file) : null));
    }

    // show popup to start editing a task
    const startEditing = async (task) => {
        const file = await getFilePreview(task.id);
        setEditingTask(task);
        setTitleTask(task.title);
        setDescriptionTask(task.description);
        setDeadline(task.deadline);
        setStatus(task.status);
        setFile(task.attachment_url);
        setPreviewUrl(file ? URL.createObjectURL(file) : null);
        setIsPopupOpen(true);
    };

    // Save the edited task
    const saveEdit = () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('title', titleTask);
        formData.append('description', descriptionTask);
        formData.append('deadline', deadline);
        formData.append('status', status);
        if (file) {
            formData.append('attachment_url', file);
        }

        try {
            api.post(`/tasks/${editingTask.id}?_method=PUT`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(response => {
                setLoading(false);
                setSuccess('Task updated successfully.');
                setError(null);
                setEditingTask(null);
                setTitleTask('');
                setFile(null);
                setPreviewUrl(null);
                setTimeout(() => {
                    fetchTasks();
                    setIsPopupOpen(false);
                    setSuccess(null);
                }, 2000);
            }).catch(error => {
                setLoading(false);
                if (error.response && error.response.status === 422) {
                    if (error.response.data.errors.title) {
                        setError(error.response.data.errors.title[0]);
                    } else if (error.response.data.errors.status) {
                        setError(error.response.data.errors.status[0]);
                    } else if (error.response.data.errors.deadline) {
                        setError(error.response.data.errors.deadline[0]);
                    } else if (error.response.data.errors.attachment_url) {
                        setError(error.response.data.errors.attachment_url[0]);
                    } else {
                        setError('Check your form inputs.');
                    }
                } else {
                    setError('An error occurred. Please try again.');
                }
            });
        } catch (error) {
            setLoading(false);
            setSuccess(null);
            setError('An error occurred. Please try again.');
        }

    };

    // Delete a task
    const deleteTask = (id) => {
        confirm('Are you sure you want to delete this task?') && api.delete(`/tasks/${id}?_method=DELETE`).then(response => {
            showTask(tasks.filter(task => task.id !== id));
        }).catch(error => {
            alert('An error occurred. Please try again.');
        });
    };

    // Logout the user
    const logoutApp = () => {
        const logout = confirm('Are you sure you want to logout?');
        if (logout) {
            api.post('/logout').then(response => {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }).catch(error => {
                console.error(error);
            });
        }
    };

    // Handle file change on file input
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            alert('Please select a PDF file.');
            setFile(null);
        }
    };

    return (
        <div className="p-4 bg-gray-100 h-screen w-full">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Task Management System</h1>
                    <button
                        onClick={() => logoutApp()}
                        className="bg-red-600 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                        disabled={loading}
                    >
                        Logout
                    </button>
                </div>

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
                                        <Alert message={task.status === 'pending' ? 'Pending' : task.status === 'in_progress' ? 'In Progress' : 'Completed'} type={task.status === 'pending' ? 'warning' : task.status === 'in_progress' ? 'info' : 'success'} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => detailTask(task)}
                                            className="text-blue-600 hover:text-blue-900 mr-3 transition duration-300 ease-in-out"
                                        >
                                            <BsEye className="inline-block mr-1" size={18} />
                                            View
                                        </button>
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

                {detailPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="relative p-8 bg-white w-full max-w-6xl m-4 rounded-xl shadow-2xl">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{titleTask}</h3>
                            <div className="flex items-center gap-4">
                                <span className={`bg-${status === 'pending' ? 'yellow' : status === 'in_progress' ? 'blue' : 'green'}-100 border border-${status === 'pending' ? 'yellow' : status === 'in_progress' ? 'blue' : 'green'}-400 text-${status === 'pending' ? 'yellow' : status === 'in_progress' ? 'blue' : 'green'}-700 px-3 py-1 rounded-lg`}>{status === 'pending' ? 'Pending' : status === 'in_progress' ? 'In Progress' : 'Completed'}</span>
                                <div className="text-sm text-center">
                                    <p>Due Date</p>
                                    <p className="text-red-600">{deadline}</p>
                                </div>
                            </div>
                            <p className="mt-3">{descriptionTask}</p>
                            {previewUrl && (
                                <div className="my-4">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Attachment Preview:</h4>
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[30rem] border border-gray-300 rounded-lg"
                                        title="PDF Preview"
                                    ></iframe>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => { setDetailPopup(false); setPreviewUrl(null); }}
                                    className="bg-red-600 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                    disabled={loading}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                        <div className="relative p-8 bg-white w-full max-w-2xl m-4 rounded-xl shadow-2xl">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                            {error && <Alert message={error} type="error" />}
                            {success && <Alert message={success} type="success" />}
                            <label className="block text-gray-700 text-sm font-bold mb-2 mt-2" htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                disabled={loading}
                                value={titleTask}
                                onChange={(e) => setTitleTask(e.target.value)}
                                placeholder="Enter task title"
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            />
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                disabled={loading}
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
                                disabled={loading}
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            />
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">Status</label>
                            <select
                                id="status"
                                disabled={loading}
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 mb-4"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file-upload">
                                    Attach PDF
                                </label>
                                <input
                                    id="file-upload"
                                    disabled={loading}
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    className="w-full text-gray-700 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            {previewUrl && (
                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold mb-2 text-gray-700">Attachment Preview:</h4>
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
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 mr-3 text-white animate-spin"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2s-.9 2-2 2H6c-1.1 0-2-.9-2-2z"></path>
                                            </svg>
                                            Loading...
                                        </span>
                                    ) : (
                                        editingTask ? 'Save Changes' : 'Add Task'
                                    )}
                                </button>
                                <button
                                    onClick={() => { setIsPopupOpen(false); setPreviewUrl(null); }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                                    disabled={loading}
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