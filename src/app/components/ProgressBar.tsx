"use client"

interface ProgressBarProps {
    current: number
    total: number | null
    label?: string
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
    const percentage = total ? Math.min((current / total) * 100, 100) : 0
    const isIndeterminate = total === null

    return (
        <div className="w-full max-w-md">
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-400">{label}</span>
                    <span className="text-sm font-medium text-green-400">
                        {total ? `${current} / ${total}` : `${current} loaded...`}
                    </span>
                </div>
            )}
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                {isIndeterminate ? (
                    <div className="h-full bg-gradient-to-r from-green-600 via-green-400 to-green-600 rounded-full animate-pulse w-full" />
                ) : (
                    <div
                        className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                )}
            </div>
            {!isIndeterminate && (
                <div className="text-center text-xs text-neutral-500 mt-1">
                    {percentage.toFixed(0)}%
                </div>
            )}
        </div>
    )
}
