import React from "react";

export default function Breadcrumbs({ handle_breadcrumb_click,
    repo_name,
    current_path }) {
    return (
        <div className='breadcrumbs '>
            {(
                <div className="flex gap-2 text-sm text-blue-300 mb-4 items-center overflow-x-auto whitespace-nowrap scrollbar-thin">
                    <span
                        className={repo_name ? "cursor-pointer hover:underline" : "text-gray-400 cursor-default"}
                        onClick={repo_name ? () => handle_breadcrumb_click('') : undefined}
                    >
                        {repo_name || 'Your repo name'}
                    </span>
                    {current_path.split('/').map((segment, index, arr) => {
                        const fullPath = arr.slice(0, index + 1).join('/');
                        return (
                            <React.Fragment key={index}>
                                <span>/</span>
                                <span
                                    onClick={() => handle_breadcrumb_click(fullPath)}
                                    className="cursor-pointer hover:underline"
                                >
                                    {segment}
                                </span>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
        </div>
    )
}