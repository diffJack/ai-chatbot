'use client'

import {Label} from "@/components/ui/label";
import {useSession} from "next-auth/react";
import {HTMLInputTypeAttribute, useActionState, useEffect, useMemo} from "react";
import {toast} from "@/components/toast";
import {Input} from "@/components/ui/input";
import {SubmitButton} from "@/components/submit-button";
import {EditActionState, update} from "@/app/(auth)/actions";
import {redirect} from "next/navigation";

interface User {
    name: string
    email: string
    id: string
    password: string
}

interface FormRowProps {
    label: string
    user: User
    field: keyof NonNullable<User>
    disabled?: boolean
    inputType?: HTMLInputTypeAttribute
}

export default function Page() {
    const { data } = useSession()
    const user = useMemo(() => {
        return data?.user as User | null
    }, [data])

    if (!user) return null

    return (
        <div className="px-10 py-12 bg-white rounded-xl">
            <div className="pb-3 pt-2">
                <Label className="text-2xl font-semibold text-primary">我的账户</Label>
            </div>
            <Form user={user} />
        </div>
    )
}

const Form = ({ user }: { user: User }) => {
    const [state, formAction, isPending] = useActionState<EditActionState, FormData>(update, {
        status: 'idle',
        name: user.name
    })

    const { update: updateSession } = useSession();

    useEffect(() => {
        if (state.status === 'failed') {
            toast({ type: 'error', description: 'update failed' });
        } else if (state.status === 'success') {
            toast({ type: 'success', description: 'update success' });
            updateSession({ name: state.name }).finally(() => {
                redirect('/')
            })
        }
    }, [state]);

    return (
        <form action={formAction}>
            <FormItem label="用户名" user={user} field="name" />
            <SubmitButton isSuccessful={isPending}>update</SubmitButton>
        </form>
    )
}

const FormItem = ({ label, user, field, disabled = false, inputType = 'text' }: FormRowProps) => {
    return (
        <div className="mb-8">
            <Label className="text-primary">
                {label}
            </Label>
            <div className="mt-2 flex w-full items-center justify-between gap-2">
                <Input name={field} type={inputType} defaultValue={user[field]} readOnly={disabled}></Input>
            </div>
        </div>
    )
}
