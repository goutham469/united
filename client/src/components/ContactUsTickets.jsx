import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { baseURL } from '../App';

function ContactUsTickets() {
  const [tickets, setTickets] = useState([]);
  const [expandedIssues, setExpandedIssues] = useState({});



  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch(`${baseURL}/api/survey/getAllForms`);
        const result = await res.json();

        if (result.success) {
          setTickets(result.data);
        } else {
          toast.error('Failed to retrieve tickets.');
        }
      } catch (err) {
        console.error(err);
        toast.error('Server Error. Please try again.');
      }
    }

    fetchTickets();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Us Tickets</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Mobile</th>
              <th className="py-2 px-4 border">Issue</th>
              <th className="py-2 px-4 border">Created At</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Ticket ticket={ticket} />
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4 text-gray-500">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
    </div>
  );
}

export default ContactUsTickets;


function Ticket({ticket})
{
    const [expandIssue , setExpandIssue] = useState(false);

    async function deleteTicket()
    {
      let data = await fetch(`${baseURL}/api/survey/deleteTicket`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id : ticket._id})
      })

      if(data.ok){
        toast.success("ticket deleted successfully .")
        location.reload(true);
      }else{
        toast.error("failed to delete ticket.")
      }
    }

    return <tr key={ticket._id} className="text-center">
                <td className="py-2 px-4 border">{ticket.name}</td>
                <td className="py-2 px-4 border">{ticket.email}</td>
                <td className="py-2 px-4 border">{ticket.mobile || 'N/A'}</td>
                <td className="py-2 px-4 border">
                <div
                    className={!expandIssue?"truncate max-w-xs cursor-pointer" : "cursor-pointer bg-grey-400"}
                >
                    {
                        expandIssue ? (
                        <div onClick={()=>setExpandIssue(expandIssue?false:true)}    >
                            {
                                ticket.issue.split('\n').map(line=><p>{line}</p>)
                            }
                        </div>
                        ) : (
                        <span   onClick={()=>setExpandIssue(expandIssue?false:true)}  >
                            {ticket.issue.length > 50 ? `${ticket.issue.substring(0, 50)}...` : ticket.issue}
                        </span>
                        )
                    }
                </div>
                </td>
                <td className="py-2 px-4 border">
                  {new Date(ticket.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border" >
                  <button class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" onClick={(e)=>{e.preventDefault();deleteTicket();}}>Delete Ticket</button>
                </td>
            </tr>
}