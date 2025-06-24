"use client"

import React, { useState } from 'react';

// import Image from "next/image";

export default function Home() {

  const [repo_url, set_repo_url] = useState('');
  const [loading, set_loading] = useState(false);
  const [files, setFiles] = useState([]);


  const handle_submit = async (event) => {
    event.preventDefault();
    set_loading(true);
    setFiles([]);

    const parsed_url = parse_github_url(repo_url);

    if (!parsed_url) {
      alert("Invalid URL!");
      set_loading(false);
      return;
    }

    const { owner, repo } = parsed_url;

    console.log('owner: ', owner, ' repo: ', repo);
    set_loading(false);

  }

  const parse_github_url = (url) => {
    try {
      const path_name = new URL(url);
      const parts = path_name.split('/').filter(Boolean);

      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1]
        };
      }

    } catch (error) {
      console.log('error: ', error);
      return null;
    }

    return null;
  }

  return (
    // <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    //   <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
    //     <Image
    //       className="dark:invert"
    //       src="/next.svg"
    //       alt="Next.js logo"
    //       width={180}
    //       height={38}
    //       priority
    //     />
    //     <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
    //       <li className="mb-2 tracking-[-.01em]">
    //         Get started by editing{" "}
    //         <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
    //           src/app/page.js
    //         </code>
    //         .
    //       </li>
    //       <li className="tracking-[-.01em]">
    //         Save and see your changes instantly.
    //       </li>
    //     </ol>

    //     <div className="flex gap-4 items-center flex-col sm:flex-row">
    //       <a
    //         className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
    //         href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <Image
    //           className="dark:invert"
    //           src="/vercel.svg"
    //           alt="Vercel logomark"
    //           width={20}
    //           height={20}
    //         />
    //         Deploy now
    //       </a>
    //       <a
    //         className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
    //         href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         Read our docs
    //       </a>
    //     </div>
    //   </main>
    //   <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
    //     <a
    //       className="flex items-center gap-2 hover:underline hover:underline-offset-4"
    //       href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/file.svg"
    //         alt="File icon"
    //         width={16}
    //         height={16}
    //       />
    //       Learn
    //     </a>
    //     <a
    //       className="flex items-center gap-2 hover:underline hover:underline-offset-4"
    //       href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/window.svg"
    //         alt="Window icon"
    //         width={16}
    //         height={16}
    //       />
    //       Examples
    //     </a>
    //     <a
    //       className="flex items-center gap-2 hover:underline hover:underline-offset-4"
    //       href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       <Image
    //         aria-hidden
    //         src="/globe.svg"
    //         alt="Globe icon"
    //         width={16}
    //         height={16}
    //       />
    //       Go to nextjs.org →
    //     </a>
    //   </footer>
    // </div>

    <div>
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6">🎨 ColorCommits</h1>

        <form onSubmit={handle_submit} className="mb-4 space-y-4 ">
          <input type="text" placeholder='Enter Github Url' value={repo_url} onChange={(e) => set_repo_url(e.target.value)} className='w-full p-3 text-white rounded-lg border-1 border-amber-100' />

          <button type='submit' className='bg-indigo-600 hover:bg-indigo-800 px-4 py-2 rounded text-white font-semibold ' > Analyze Repo </button>
        </form>

        {loading && <p className='text-yellow-300' >Fetching data.....</p>}

        <ul className='mt-8 space-y-2' >
          {files.map((files, index) => (<li key={index} className='p-2 rounded bg-gray-700'>
            {files.path} - <span className='font-mono' > {files.date} </span>
          </li>
          ))}

        </ul>

      </main>
    </div>
  );



}
