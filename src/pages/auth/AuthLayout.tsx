
import { Outlet } from 'react-router-dom';
import { Rocket } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side: Branding / Hero */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white">
                <div className="flex items-center gap-2 text-2xl font-bold">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Rocket className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span>Antigravity</span>
                </div>

                <div className="space-y-4">
                    <blockquote className="text-2xl font-medium">
                        "A melhor maneira de prever o futuro é criá-lo. Gerencie seu negócio com inteligência e elegância."
                    </blockquote>
                    <p className="text-zinc-400 text-sm">Design & Tecnologia Premium</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-sm space-y-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
