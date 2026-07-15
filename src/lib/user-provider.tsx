import {
  createContext,
  useContext,
  createSignal,
  createResource,
  createMemo,
  createEffect,
  onMount,
  type JSX,
  type Accessor,
} from 'solid-js'
import { isServer } from 'solid-js/web'
import { authClient } from './auth-client'
import { getSelectedOrgId, setSelectedOrg, initSelectedOrg } from './org-store'

type UserEntry = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: string
  image: string | null
  createdAt: string
  updatedAt: string
}

type OrgInfo = { id: string; name: string }

type UsersResponse = {
  users: UserEntry[]
  userOrgs: Record<string, OrgInfo[]>
  currentUserRole: string
  firstUserId: string | null
}

type OrgMemberEntry = {
  id: string
  userId: string
  role: string
  createdAt: string
  userName: string
  userEmail: string
}

type OrgMembersResponse = {
  members: OrgMemberEntry[]
  ownerId: string | null
  domainAutoJoin: boolean
}

type UserContextValue = {
  session: ReturnType<typeof authClient.useSession>
  orgs: Accessor<OrgEntry[]>
  orgsLoading: Accessor<boolean>
  isAdmin: Accessor<boolean>
  selectedOrgId: Accessor<string | null>
  setSelectedOrgId: (id: string | null) => void
  users: Accessor<UserEntry[]>
  usersLoading: Accessor<boolean>
  firstUserId: Accessor<string | null>
  userOrgsData: Accessor<Record<string, OrgInfo[]>>
  refetchUsers: () => void
  members: Accessor<OrgMemberEntry[]>
  membersLoading: Accessor<boolean>
  ownerId: Accessor<string | null>
  isOwner: Accessor<boolean>
  canManage: Accessor<boolean>
  domainAutoJoin: Accessor<boolean>
  refetchMembers: () => void
}

type OrgEntry = { id: string; name: string }

const UserContext = createContext<UserContextValue>()

export function useUserContext() {
  return useContext(UserContext)!
}

export function UserProvider(props: { children: JSX.Element }) {
  const session = authClient.useSession()

  return (
    <UserDataLayer session={session}>
      {props.children}
    </UserDataLayer>
  )
}

function UserDataLayer(props: {
  children: JSX.Element
  session: ReturnType<typeof authClient.useSession>
}) {
  const [fetchTick] = createSignal(!isServer)

  onMount(() => {
    if (!isServer) initSelectedOrg()
  })

  const selectedOrgId = createMemo(() => {
    const id = getSelectedOrgId()()
    return !id || id === 'all' ? null : id
  })

  const [orgsData] = createResource(
    fetchTick,
    async () => {
      const res = await fetch('/api/organizations')
      if (res.status === 401) {
        window.location.href = '/sign-in'
        throw new Error('Unauthorized')
      }
      return res.json()
    },
  )

  const [usersData, { refetch: refetchUsers }] = createResource(
    fetchTick,
    async () => {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data: UsersResponse = await res.json()
      return data
    },
  )

  const [membersData, { refetch: refetchMembers }] = createResource<OrgMembersResponse | null, string | null>(
    selectedOrgId,
    async (oid) => {
      if (!oid) return null
      const res = await fetch(`/api/org-members?orgId=${encodeURIComponent(oid)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to fetch members')
      }
      return res.json()
    },
  )

  const orgs = createMemo(() => orgsData()?.orgs ?? [])
  const isAdmin = createMemo(() => orgsData()?.currentUserRole === 'admin')

  createEffect(() => {
    const list = orgs()
    const current = getSelectedOrgId()()
    if (!current && list.length > 0) {
      setSelectedOrg(isAdmin() ? 'all' : list[0].id)
    }
  })

  const users = createMemo(() => usersData()?.users ?? [])
  const firstUserId = createMemo(() => usersData()?.firstUserId ?? null)
  const userOrgsData = createMemo(() => usersData()?.userOrgs ?? {})

  const members = createMemo(() => membersData()?.members ?? [])
  const ownerId = createMemo(() => membersData()?.ownerId ?? null)
  const domainAutoJoin = createMemo(() => membersData()?.domainAutoJoin ?? false)
  const isOwner = createMemo(() => {
    const uid = props.session().data?.user?.id
    return ownerId() != null && uid != null && ownerId() === uid
  })
  const canManage = createMemo(() => isAdmin() || isOwner())

  const value: UserContextValue = {
    session: props.session,
    orgs,
    orgsLoading: () => orgsData.loading,
    isAdmin,
    selectedOrgId,
    setSelectedOrgId: setSelectedOrg,
    users,
    usersLoading: () => usersData.loading,
    firstUserId,
    userOrgsData,
    refetchUsers,
    members,
    membersLoading: () => membersData.loading,
    ownerId,
    isOwner,
    canManage,
    domainAutoJoin,
    refetchMembers,
  }

  return (
    <UserContext.Provider value={value}>
      {props.children}
    </UserContext.Provider>
  )
}
