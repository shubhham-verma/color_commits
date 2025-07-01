export default function Form({ handle_submit,
    repo_url,
    set_repo_url }) {
    return (
        <form onSubmit={handle_submit} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                    required
                    aria-label="GitHub repository URL"
                    type="text"
                    placeholder="Enter GitHub URL"
                    value={repo_url}
                    onChange={(e) => set_repo_url(e.target.value)}
                    className="w-full sm:flex-1 p-3 text-white rounded-lg border border-amber-100 bg-gray-800"
                />

                <button
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-800 px-11 py-2 rounded text-white font-semibold"
                >
                    Analyze Repo
                </button>
            </div>
        </form>
    )
}   