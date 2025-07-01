"use client"

import Loader from '@/components/loader';
import React, { useState } from 'react';

export default function Home() {

  const [repo_url, set_repo_url] = useState('');
  const [repo_name, set_repo_name] = useState('');
  const [owner_name, set_owner_name] = useState('');
  const [loading, set_loading] = useState(false);
  const [files, setFiles] = useState([]);
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const [current_path, set_current_path] = useState('');

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
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) {
      console.log('Error in get_last_commit_date for file: ', file_path);
      console.log(res);
      return null;
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

  };

  const parse_github_url = (url) => {
    try {
      const formatted_url = new URL(url);
      const parts = formatted_url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return {
          owner: parts[0],
          repo: parts[1],
          path: parts[2]
        };
      }

    } catch (error) {
      console.log('error in parse_github_url : ', error);
      return null;
    }

    return null;
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

  const path_manager = (path) => {
    set_current_path(path);
    const segments = path.split('/').filter(Boolean);
  }

  const handle_breadcrumb_click = async (new_path) => {
    set_current_path(new_path);

    const updated_files = await get_folder_contents(owner_name, repo_name, new_path);

    setFiles(updated_files);


  }

  const get_folder_contents = async (owner, repo, path = '') => {

    set_loading(true);
    path_manager(path);

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      const error = await res.json();
      throw new Error(`${JSON.stringify(error)}`);
    }

    const data = await res.json();

    const final_list = await Promise.all(
      data.map(async (element) => {
        let date = 'unknown';
        if (element.type === 'file' || element.type === 'dir') {
          date = await get_last_commit_date(owner, repo, element.path);

        }
        return {
          name: element.name,
          path: element.path,
          type: element.type,
          date: new Date(date).toLocaleString(),
        };
      })
    );

    set_loading(false);
    return final_list;
  };



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

    const { owner, repo, path = '' } = parsed_url;
    set_owner_name(owner);
    set_repo_name(repo);



    try {

      const new_data = await get_folder_contents(owner, repo, path);
      setFiles(new_data);
      set_loading(false);


    } catch (error) {
      console.log(`Error in handle_submit : ${error}`);
      set_loading(false);
    }

  }

  return (
    <div className='bg-gray-900 '>
      <div className='px-4 sm:px-8 lg:px-20 max-w-screen-xl mx-auto'>

        <main className="min-h-screen bg-gray-900 text-white px-8 py-6">
          <h1 className="text-4xl font-bold mb-6">🎨 ColorCommits</h1>

          <form onSubmit={handle_submit} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <input
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


          {loading && <div className='text-yellow-300 flex flex-row gap-2' >
            <p>Fetching data....</p>
            <div>
              <Loader />
            </div>
          </div>}

          <br />

          <div className='breadcrumbs '>   {/** Breadcrumbs component */}
            {(
              <div className="flex gap-2 text-sm text-blue-300 mb-4 items-center overflow-x-auto whitespace-nowrap scrollbar-thin">
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handle_breadcrumb_click('')}
                >
                  {repo_name || 'Your repo name: '}

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


          <ul className='mt-8 space-y-2 ' >
            {files.map((file, index) => (

              <li key={index} className={loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}>
                <div className='px-4 py-2 sm:py-2 sm:px-12 rounded bg-gray-700 justify-between  flex flex-col sm:flex-row  content-around'>

                  <div className="flex gap-2 whitespace-nowrap overflow-x-auto">
                    <span>
                      {file.type === 'dir' ? '📁' : '🗎'}   {/** File icon */}
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

                  {/** Tooltip component */}
                  <div className={`font-mono ${get_age_color(file.date)}`}
                    onMouseEnter={() => setTooltipIndex(index)}
                    onMouseLeave={() => setTooltipIndex(null)}
                    onFocus={() => setTooltipIndex(index)}
                    onBlur={() => setTooltipIndex(null)}
                    style={{ position: 'relative' }}
                  >

                    {<div>
                      {date_text(file.date)}  {/** Actual date component */}

                      {tooltipIndex === index && (
                        <div
                          className="absolute bottom-full mb-2 px-3 py-2 text-sm font-medium text-white bg-gray-900
                           rounded-lg shadow-md whitespace-nowrap"
                          style={{ maxWidth: '80vw', left: '50%', transform: 'translateX(-50%)' }}
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

        </main>
      </div>

    </div>
  );

}
