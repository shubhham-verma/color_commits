export default function FileList({ files,
    loading,
    setTooltipIndex,
    tooltipIndex,
    handle_breadcrumb_click,
    get_age_color,
    date_text }) {
    return (
        <ul className='mt-8 space-y-2 ' >
            {files.map((file, index) => (

                <li key={file.path} className={loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}>
                    <div className='px-4 py-2 sm:py-2 sm:px-12 rounded bg-gray-700 justify-between  flex flex-col sm:flex-row  content-around'>

                        <div className="flex gap-2 whitespace-nowrap overflow-x-auto ">
                            <span className="w-5 text-center">
                                {file.type === 'dir' ? '📁' : '🗎'}   
                            </span>

                            {file.type === 'dir' ? (
                                <span
                                    className="cursor-pointer text-blue-300 hover:underline truncate overflow-hidden max-w-[60vw] sm:max-w-[40vw]"
                                    onClick={() => handle_breadcrumb_click(file.path)}
                                >
                                    {file.name}
                                </span>
                            ) : (
                                <span>{file.name}</span>
                            )}
                        </div>

                        
                        <div className={`font-mono ${get_age_color(file.date)} relative inline-block`}
                            onMouseEnter={() => setTooltipIndex(index)}
                            onMouseLeave={() => setTooltipIndex(null)}
                            onFocus={() => setTooltipIndex(index)}
                            onBlur={() => setTooltipIndex(null)}
                        >

                            {<div>
                                {date_text(file.date)}  

                                {tooltipIndex === index && (
                                    <div
                                        className="absolute bottom-full mb-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-md whitespace-nowrap max-w-[80vw] left-1/2 -translate-x-1/2"

                                    >
                                        {new Date(file.date).toLocaleDateString()}
                                        <div className="tooltip-arrow" data-popper-arrow></div>
                                    </div>
                                )}
                            </div>}
                        </div>
                    </div>

                </li>
            ))}

        </ul>
    )
}