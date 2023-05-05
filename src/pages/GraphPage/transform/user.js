export const createUserNode = (user = {}, data = {}) => ({
  id: user.name,
  type: 'userNode',
  data: {
    label: `${user.attrib?.fullName} (${user.name})`,
    type: 'user',
    ...user,
    ...data,
  },
})
