"use client"

import Loader from '@/components/loader';
import React, { useState } from 'react';

export default function Home() {

  const [repo_url, set_repo_url] = useState('');
  const [loading, set_loading] = useState(false);
  const [files, setFiles] = useState([]);
  const [tooltipIndex, setTooltipIndex] = useState(null);


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

  const get_age_color = (dateString) => {
    if (!dateString || dateString === 'unknown') return 'text-gray-500';

    const daysOld = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));

    if (daysOld <= 7) return 'text-green-400';
    if (daysOld <= 30) return 'text-yellow-400';
    if (daysOld <= 90) return 'text-orange-400';
    if (daysOld <= 365) return 'text-red-400';
    return 'text-gray-500';
  };

  const date_text = (dateString) => {
    if (!dateString || dateString === 'unknown') return 'unknown';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  };

  return (
    <div className='bg-gray-900 '>
      <div className='px-50 mx-30'>

        <main className="min-h-screen bg-gray-900 text-white p-8 ">
          <h1 className="text-4xl font-bold mb-6">🎨 ColorCommits</h1>

          <form onSubmit={handle_submit} className="mb-4 space-y-4 ">
            <input type="text" placeholder='Enter Github Url' value={repo_url} onChange={(e) => set_repo_url(e.target.value)} className='w-full p-3 text-white rounded-lg border-1 border-amber-100' />

            <button type='submit' className='bg-indigo-600 hover:bg-indigo-800 px-4 py-2 rounded text-white font-semibold ' > Analyze Repo </button>
          </form>

          {/* <div>
            <button data-tooltip-target="tooltip-right" data-tooltip-placement="right" type="button" className="ms-3 mb-2 md:mb-0 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Tooltip right</button>

            <div id="tooltip-right" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
              Tooltip on right
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div> */}

          {loading && <div className='text-yellow-300 flex flex-row gap-2' >
            <p>Fetching data....</p>
            <div>
              <Loader />
            </div>
          </div>}


          <ul className='mt-8 space-y-2 ' >
            {files.map((file, index) => (<li key={index} className='p-2 rounded bg-gray-700 flex justify-between px-15'>
              {file.path}
              -
              <span className={`font-mono ${get_age_color(file.date)}`}
                onMouseEnter={() => setTooltipIndex(index)}
                onMouseLeave={() => setTooltipIndex(null)}
                onFocus={() => setTooltipIndex(index)}
                onBlur={() => setTooltipIndex(null)}
                style={{ position: 'relative' }} // Ensure tooltip is positioned correctly
              >
                {/* title={`${new Date(file.date).toLocaleString()}`} */}

                {<div>
                  {date_text(file.date)}
                  {tooltipIndex === index && (
                    <div
                      className="absolute z-10 inline-block px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xs tooltip dark:bg-gray-500"
                      style={{ left: '100%', top: 0, marginLeft: 8 }}
                    >
                      {new Date(file.date).toLocaleDateString()}
                      <div className="tooltip-arrow" data-popper-arrow></div>
                    </div>
                  )}
                </div>}
              </span>
            </li>
            ))}

          </ul>

        </main>
      </div>

    </div>
  );



}
