'use server';

import { z } from 'zod';

import {createUser, getUser, updateUser} from '@/lib/db/queries';
import {auth, signIn} from './auth';
import {generateRandomName} from "@/lib/utils";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password, generateRandomName());
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

const editFormSchema = z.object({
  name: z.string().min(1).max(12),
});

export interface EditActionState {
  status: 'idle' | 'invalid_session' | 'success' | 'invalid_data' | 'failed'
  name: string
}

export const update = async (state: EditActionState, formData: FormData) => {
  try {
    const validatedData = editFormSchema.parse({
      name: formData.get('name'),
    });

    const session = await auth()

    if (!session) {
      return { status: 'invalid_session' }
    }

    await updateUser(session.user.email!, {
      name: validatedData.name
    })

    return {
      ...state,
      name: validatedData.name,
      status: 'success'
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
}
