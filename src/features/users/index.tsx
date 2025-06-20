import { Main } from '@/components/layout/main'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import { User, userListSchema } from './data/schema'
import UsersProvider from './context/users-context'
import useSWR from 'swr';
import { fetcher } from '@/lib/api'

interface UsersApiResponse  {
  success: boolean;
  users: User[];
};

export default function Users() {

  const { data, error, isLoading } = useSWR<UsersApiResponse>('/api/users', fetcher)

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load users: {error instanceof Error ? error.message : 'Unknown error occurred'}</div>;
  if (!data?.success) return <div>No users found.</div>;
  // Parse user list
  const userList = userListSchema.parse(data.users);

  return (
    <UsersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}

