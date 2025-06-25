"use client"

import Loader from '@/components/loader';
import React, { useState } from 'react';

export default function Home() {

  const [repo_url, set_repo_url] = useState('');
  const [loading, set_loading] = useState(false);
  const [files, setFiles] = useState([]);

  const TOKEN = process.env.NEXT_PUBLIC_TOKEN;

  const getDefaultBranch = async (owner, repo) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch repo metadata: ${res.status}`);
    }

    const data = await res.json();
    return data.default_branch;
  };

  const get_last_commit_date = async (owner, repo, file_path) => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(file_path)}&per_page=1`, {
      headers: {
        Authorization: `Beared ${TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) {
      console.log('Error in get_last_commit_date: ');
      console.log(res);
    }

    const data = await res.json();
    if (data.length === 0) {
      console.log('Exiting where data.length === 0 ');
      return null; // No commit history
    }

    const final = data[0].commit.author.date; // ISO timestamp
    // console.log('final: ', final);
    // console.log(final);

    return final;

  }

  const get_file_tree = async (owner, repo, branch = 'master') => {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/vnd.github+json'
        }
      });

      if (res.status != 200)
        return `Error in github api:`, res.json();

      const data = await res.json();

      const final = data.tree.filter((item) => (item.type === 'blob'));
      return final;

    } catch (error) {
      console.log(`Error in get_file_tree: ${res}`);
    }
  }

  const parse_github_url = (url) => {
    try {
      const formatted_url = new URL(url);
      // console.log(formatted_url.pathname);
      const parts = formatted_url.pathname.split('/').filter(Boolean);

      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1]
        };
      }

    } catch (error) {
      console.log('error in parse_github_url : ', error);
      return null;
    }

    return null;
  }

  const handle_submit = async (event) => {
    event.preventDefault();
    set_loading(true);
    setFiles([]);

    // await new Promise((resolve) => setTimeout(resolve, 1500));

    const parsed_url = parse_github_url(repo_url);

    if (!parsed_url) {
      alert("Invalid URL!");
      set_loading(false);
      return;
    }
    const { owner, repo } = parsed_url;

    // console.log('owner: ', owner, ' repo: ', repo);
    // set_loading(false);

    try {

      const branch = await getDefaultBranch(owner, repo);
      const file_tree = await get_file_tree(owner, repo, branch);

      const limited_tree = file_tree.slice(0, 20);

      const files_with_dates = await Promise.all(
        limited_tree.map(async (file) => {
          const date = await get_last_commit_date(owner, repo, file.path);
          // console.log('date: ', date);

          return {
            path: file.path,
            date: date ? new Date(date).toLocaleDateString() : 'Unknown'
          }
        })
      );

      console.log('files_with_dates');
      console.log(files_with_dates);
      setFiles(files_with_dates);

      // console.log('Files: ', file_tree);


      setFiles(dummy_data);
      set_loading(false);


    } catch (error) {
      console.log(`Error in handle_submit : ${error}`);
      set_loading(false);
      // alert(`Error fetching: ${error}`);
    }



  }



  return (
    <div>
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-6">🎨 ColorCommits</h1>

        <form onSubmit={handle_submit} className="mb-4 space-y-4 ">
          <input type="text" placeholder='Enter Github Url' value={repo_url} onChange={(e) => set_repo_url(e.target.value)} className='w-full p-3 text-white rounded-lg border-1 border-amber-100' />

          <button type='submit' className='bg-indigo-600 hover:bg-indigo-800 px-4 py-2 rounded text-white font-semibold ' > Analyze Repo </button>
        </form>

        {loading && <div className='text-yellow-300 flex flex-row gap-2' >
          <p>Fetching data....</p>
          <div>
            <Loader />
          </div>
        </div>}

        <ul className='mt-8 space-y-2' >
          {files.map((file, index) => (<li key={index} className='p-2 rounded bg-gray-700'>
            {file.path} - <span className='font-mono' > {file.date } </span>
          </li>
          ))}

        </ul>

      </main>
    </div>
  );



}
