"use client"

import Breadcrumbs from '@/components/breadcrumbs';
import Form from '@/components/form';
import Loader from '@/components/loader';
import FileList from '@/components/file_list';

import { get_age_color, date_text } from '@/utils/helper';

import use_github_repo from '@/hooks/use_github_repo';

import React, { useState } from 'react';

export default function Home() {

  const [repo_url, set_repo_url] = useState('');
  const [repo_name, set_repo_name] = useState('');
  const [owner_name, set_owner_name] = useState('');
  const [loading, set_loading] = useState(false);
  const [files, set_files] = useState([]);
  const [tooltipIndex, setTooltipIndex] = useState(null);
  const [current_path, set_current_path] = useState('');

  const TOKEN = process.env.NEXT_PUBLIC_TOKEN;

  const {
    handle_breadcrumb_click,
    handle_submit
  } = use_github_repo(TOKEN);

  return (
    <div className='bg-gray-900 '>
      <div className='px-4 sm:px-8 lg:px-20 max-w-screen-xl mx-auto'>

        <main className="min-h-screen bg-gray-900 text-white px-8 py-6">
          <h1 className="text-4xl font-bold mb-6">🎨 ColorCommits</h1>

          <Form repo_url={repo_url}
            handle_submit={(e) => { handle_submit(e, repo_url, set_loading, set_files, set_owner_name, set_repo_name, set_current_path) }}
            set_repo_url={set_repo_url}
          />

          {loading && <Loader />}

          <br />

          <Breadcrumbs repo_name={repo_name}
            handle_breadcrumb_click={(new_path) => { handle_breadcrumb_click(new_path, set_current_path, set_files, owner_name, repo_name, set_loading) }}
            current_path={current_path}
          />

          <FileList files={files}
            loading={loading}
            setTooltipIndex={setTooltipIndex}
            tooltipIndex={tooltipIndex}
            handle_breadcrumb_click={(new_path) => { handle_breadcrumb_click(new_path, set_current_path, set_files, owner_name, repo_name, set_loading) }}
            get_age_color={get_age_color}
            date_text={date_text}
          />

        </main>
      </div>

    </div>
  );

}
