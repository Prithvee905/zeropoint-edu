export default function ProgressPage() {
    return (
        <div>

            <h1 className="text-3xl font-bold mb-6">
                Your Progress
            </h1>

            <div className="bg-white p-6 rounded-xl shadow text-black">

                <p className="mb-4">
                    You have completed 20% of your roadmap
                </p>

                <div className="w-full bg-gray-200 h-4 rounded">
                    <div className="bg-black h-4 rounded w-1/5"></div>
                </div>

            </div>

        </div>
    )
}