import { Modal, Table, Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { getApiUrl } from '../utils/api';

export default function DashUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState('');
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(getApiUrl('/api/user/getusers'), {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          if (data.users.length < 9) {
            setShowMore(false);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
    }
  }, [currentUser._id]);

  const handleShowMore = async () => {
    const startIndex = users.length;
    try {
      const res = await fetch(getApiUrl(`/api/user/getusers?startIndex=${startIndex}`), {
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, ...data.users]);
        if (data.users.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteUser = async () => {
    try {
        const res = await fetch(getApiUrl(`/api/user/delete/${userIdToDelete}`), {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
            setUsers((prev) => prev.filter((user) => user._id !== userIdToDelete));
            setShowModal(false);
        } else {
            console.log(data.message);
        }
    } catch (error) {
        console.log(error.message);
    }
  };

  return (
    <div className='w-full overflow-x-auto md:mx-auto p-2 sm:p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <Table hoverable className='shadow-md min-w-full'>
            <Table.Head>
              <Table.HeadCell className='text-xs sm:text-sm'>Date created</Table.HeadCell>
              <Table.HeadCell className='text-xs sm:text-sm'>User image</Table.HeadCell>
              <Table.HeadCell className='text-xs sm:text-sm'>Username</Table.HeadCell>
              <Table.HeadCell className='text-xs sm:text-sm hidden md:table-cell'>Email</Table.HeadCell>
              <Table.HeadCell className='text-xs sm:text-sm'>Admin</Table.HeadCell>
              <Table.HeadCell className='text-xs sm:text-sm'>Delete</Table.HeadCell>
            </Table.Head>
            {users.map((user) => (
              <Table.Body className='divide-y' key={user._id}>
                <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                  <Table.Cell className='text-xs sm:text-sm whitespace-nowrap'>
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Table.Cell>
                  <Table.Cell>
                    <img
                      src={user.profilePicture}
                      alt={user.username}
                      className='w-8 h-8 sm:w-10 sm:h-10 object-cover bg-gray-500 rounded-full'
                    />
                  </Table.Cell>
                  <Table.Cell className='text-xs sm:text-sm'>{user.username}</Table.Cell>
                  <Table.Cell className='text-xs sm:text-sm hidden md:table-cell'>{user.email}</Table.Cell>
                  <Table.Cell>
                    {user.isAdmin ? (
                      <FaCheck className='text-green-500 text-sm sm:text-base' />
                    ) : (
                      <FaTimes className='text-red-500 text-sm sm:text-base' />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <span
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user._id);
                      }}
                      className='text-xs sm:text-sm font-medium text-red-500 hover:underline cursor-pointer'
                    >
                      Delete
                    </span>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            ))}
          </Table>
          {showMore && (
            <button
              onClick={handleShowMore}
              className='w-full text-teal-500 self-center text-sm py-7'
            >
              Show more
            </button>
          )}
        </>
      ) : (
        <p>You have no users yet!</p>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete this user?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}