import {
  fetchMe,
  login,
  logout,
  register,
  updatePassword,
  updateProfile,
} from '@/features/auth/api'
import { authKeys } from '@/features/auth/keys'
import { queryClient } from '@/lib/queryClient'
import { useMutation, useQuery } from '@tanstack/react-query'

// Sumber kebenaran akun. 401 berarti tamu, bukan error halaman.
export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear()
      queryClient.setQueryData(authKeys.me, null)
    },
  })
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useUpdatePassword() {
  return useMutation({ mutationFn: updatePassword })
}
