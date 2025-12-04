import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
} from 'react-icons/hi';
import { Button, Table } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

export default function DashboardComp() {
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(getApiUrl('/api/user/getusers?limit=5'), {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
          setLastMonthUsers(data.lastMonthUsers);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    const fetchPosts = async () => {
      try {
        const res = await fetch(getApiUrl('/api/post/getposts?limit=5'), {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setLastMonthPosts(data.lastMonthPosts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    const fetchComments = async () => {
      try {
        const res = await fetch(getApiUrl('/api/comment/getcomments?limit=5'), {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          setTotalComments(data.totalComments);
          setLastMonthComments(data.lastMonthComments);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if (currentUser.isAdmin) {
      fetchUsers();
      fetchPosts();
      fetchComments();
    }
  }, [currentUser]);
  return (
    <div className='p-3 sm:p-4 md:p-6 w-full'>
      <div className='flex-wrap flex gap-3 sm:gap-4 justify-center'>
        <div className='flex flex-col p-3 sm:p-4 dark:bg-slate-800 gap-3 sm:gap-4 md:w-72 w-full rounded-md shadow-md'>
          <div className='flex justify-between items-start'>
            <div className=''>
              <h3 className='text-gray-500 text-xs sm:text-sm uppercase'>Total Users</h3>
              <p className='text-xl sm:text-2xl font-bold'>{totalUsers}</p>
            </div>
            <HiOutlineUserGroup className='bg-teal-600 text-white rounded-full text-4xl sm:text-5xl p-2 sm:p-3 shadow-lg' />
          </div>
          <div className='flex gap-2 text-xs sm:text-sm'>
            <span className='text-green-500 flex items-center'>
              <HiArrowNarrowUp />
              {lastMonthUsers}
            </span>
            <div className='text-gray-500'>Last month</div>
          </div>
        </div>
        <div className='flex flex-col p-3 sm:p-4 dark:bg-slate-800 gap-3 sm:gap-4 md:w-72 w-full rounded-md shadow-md'>
          <div className='flex justify-between items-start'>
            <div className=''>
              <h3 className='text-gray-500 text-xs sm:text-sm uppercase'>
                Total Comments
              </h3>
              <p className='text-xl sm:text-2xl font-bold'>{totalComments}</p>
            </div>
            <HiAnnotation className='bg-indigo-600 text-white rounded-full text-4xl sm:text-5xl p-2 sm:p-3 shadow-lg' />
          </div>
          <div className='flex gap-2 text-xs sm:text-sm'>
            <span className='text-green-500 flex items-center'>
              <HiArrowNarrowUp />
              {lastMonthComments}
            </span>
            <div className='text-gray-500'>Last month</div>
          </div>
        </div>
        <div className='flex flex-col p-3 sm:p-4 dark:bg-slate-800 gap-3 sm:gap-4 md:w-72 w-full rounded-md shadow-md'>
          <div className='flex justify-between items-start'>
            <div className=''>
              <h3 className='text-gray-500 text-xs sm:text-sm uppercase'>Total Posts</h3>
              <p className='text-xl sm:text-2xl font-bold'>{totalPosts}</p>
            </div>
            <HiDocumentText className='bg-lime-600 text-white rounded-full text-4xl sm:text-5xl p-2 sm:p-3 shadow-lg' />
          </div>
          <div className='flex gap-2 text-xs sm:text-sm'>
            <span className='text-green-500 flex items-center'>
              <HiArrowNarrowUp />
              {lastMonthPosts}
            </span>
            <div className='text-gray-500'>Last month</div>
          </div>
        </div>
      </div>
      <div className='flex flex-wrap gap-3 sm:gap-4 py-3 mx-auto justify-center'>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 text-xs sm:text-sm font-semibold gap-2'>
            <h1 className='text-center p-1 sm:p-2 text-sm sm:text-base'>Recent users</h1>
            <Button outline gradientDuoTone='purpleToPink' size='sm'>
              <Link to={'/dashboard?tab=users'}>See all</Link>
            </Button>
          </div>
          <div className='overflow-x-auto'>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className='text-xs sm:text-sm'>User image</Table.HeadCell>
                <Table.HeadCell className='text-xs sm:text-sm'>Username</Table.HeadCell>
              </Table.Head>
            {users &&
              users.map((user) => (
                <Table.Body key={user._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>
                      <img
                        src={user.profilePicture}
                        alt='user'
                        className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-500'
                      />
                    </Table.Cell>
                    <Table.Cell className='text-xs sm:text-sm'>{user.username}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </div>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 text-xs sm:text-sm font-semibold gap-2'>
            <h1 className='text-center p-1 sm:p-2 text-sm sm:text-base'>Recent comments</h1>
            <Button outline gradientDuoTone='purpleToPink' size='sm'>
              <Link to={'/dashboard?tab=comments'}>See all</Link>
            </Button>
          </div>
          <div className='overflow-x-auto'>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className='text-xs sm:text-sm'>Comment content</Table.HeadCell>
                <Table.HeadCell className='text-xs sm:text-sm'>Likes</Table.HeadCell>
              </Table.Head>
            {comments &&
              comments.map((comment) => (
                <Table.Body key={comment._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell className='max-w-xs sm:max-w-sm md:w-96'>
                        <p className='line-clamp-2 text-xs sm:text-sm'>{comment.content}</p>
                    </Table.Cell>
                    <Table.Cell className='text-xs sm:text-sm'>{comment.numberOfLikes}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </div>
        <div className='flex flex-col w-full md:w-auto shadow-md p-2 rounded-md dark:bg-gray-800'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-3 text-xs sm:text-sm font-semibold gap-2'>
            <h1 className='text-center p-1 sm:p-2 text-sm sm:text-base'>Recent posts</h1>
            <Button outline gradientDuoTone='purpleToPink' size='sm'>
              <Link to={'/dashboard?tab=posts'}>See all</Link>
            </Button>
          </div>
          <div className='overflow-x-auto'>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className='text-xs sm:text-sm'>Post image</Table.HeadCell>
                <Table.HeadCell className='text-xs sm:text-sm'>Post Title</Table.HeadCell>
                <Table.HeadCell className='text-xs sm:text-sm'>Category</Table.HeadCell>
              </Table.Head>
            {posts &&
              posts.map((post) => (
                <Table.Body key={post._id} className='divide-y'>
                  <Table.Row className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                    <Table.Cell>
                      <img
                        src={post.image}
                        alt='user'
                        className='w-10 h-8 sm:w-14 sm:h-10 rounded-md bg-gray-500'
                      />
                    </Table.Cell>
                    <Table.Cell className='max-w-xs sm:max-w-sm md:w-96 text-xs sm:text-sm'>{post.title}</Table.Cell>
                    <Table.Cell className='text-xs sm:text-sm whitespace-nowrap'>{post.category}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}