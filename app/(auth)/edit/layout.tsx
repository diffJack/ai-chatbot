import {ReactNode} from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="flex justify-center items-start pt-40 h-dvh w-dvw overflow-y-scroll overflow-x-hidden bg-gray-200">
            { children }
        </div>
    )
}
