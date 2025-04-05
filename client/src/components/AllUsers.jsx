import React, { useEffect, useState } from 'react'
import { baseURL } from '../App'
import toast from 'react-hot-toast'
import { IoPersonCircleOutline } from 'react-icons/io5'

function AllUsers() {
    const [users, setUsers] = useState([])

    async function getData() {
        let data = await fetch(`${baseURL}/api/user/all-users`)
        data = await data.json()

        console.log(data)
        if (data.success) {
            setUsers(data.data)
        } else {
            toast.error("Failed to load Data!")
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div className="p-4">
            <h4 className="text-lg font-semibold mb-4">All Users</h4>
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                        <th className="py-3 px-4 border-b border-gray-300">Sr.no</th>
                        <th className="py-3 px-4 border-b border-gray-300">Name</th>
                        <th className="py-3 px-4 border-b border-gray-300">Email</th>
                        <th className="py-3 px-4 border-b border-gray-300">Avatar</th>
                        <th className="py-3 px-4 border-b border-gray-300">Mobile</th>
                        <th className="py-3 px-4 border-b border-gray-300">Last Login</th>
                        <th className="py-3 px-4 border-b border-gray-300">Status</th>
                        <th className="py-3 px-4 border-b border-gray-300">Role</th>
                        <th className="py-3 px-4 border-b border-gray-300">Created On</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, idx) => (
                        <tr className="text-gray-700 text-sm border-b border-gray-200 hover:bg-gray-100" key={idx}>
                            <td className="py-3 px-4 text-center">{idx + 1}</td>
                            <td className="py-3 px-4">{user.name}</td>
                            <td className="py-3 px-4">{user.email}</td>
                            <td className="py-3 px-4 text-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-16 h-16 object-cover rounded-full" />
                                ) : (
                                    <IoPersonCircleOutline className="text-3xl text-gray-500" />
                                )}
                            </td>
                            <td className="py-3 px-4">{user.mobile}</td>
                            <td className="py-3 px-4">{user.last_login_date}</td>
                            <td className="py-3 px-4">{user.status}</td>
                            <td className="py-3 px-4">{user.role}</td>
                            <td className="py-3 px-4">{user.createdAt}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AllUsers
