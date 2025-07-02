import { useRef } from "react";

import { parse_github_url } from "@/utils/helper";

export default function use_github_repo(TOKEN) {
    
    const list_cache = useRef({});
    const date_cache = useRef({});

    const get_last_commit_date = async (owner, repo, file_path) => {

        const key = `${owner}/${repo}/${file_path}`;

        if (date_cache.current[key])
            return date_cache.current[key];

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

        const final = data[0].commit.author.date;

        date_cache.current[key] = final;
        return final;

    };

    const handle_breadcrumb_click = async (new_path, set_current_path, set_files, owner_name, repo_name, set_loading) => {
        set_current_path(new_path);

        const updated_files = await get_folder_contents(owner_name, repo_name, new_path, set_loading, set_current_path);

        set_files(updated_files);

    };

    const get_folder_contents = async (owner, repo, path = '', set_loading, set_current_path) => {

        const key = `${owner}/${repo}/${path}`;

        if (list_cache.current[key])
            return list_cache.current[key];

        set_loading(true);
        set_current_path(path);

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
                    date: date,
                };
            })
        );

        list_cache.current[key] = final_list;
        set_loading(false);
        return final_list;
    };

    const handle_submit = async (event, repo_url, set_loading, set_files, set_owner_name, set_repo_name, set_current_path) => {
        event.preventDefault();
        set_loading(true);
        set_files([]);

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

            const new_data = await get_folder_contents(owner, repo, path, set_loading, set_current_path);
            set_files(new_data);
            set_loading(false);


        } catch (error) {
            console.log(`Error in handle_submit : ${error}`);
            set_loading(false);
        }

    };

    return {
        get_last_commit_date,
        handle_breadcrumb_click,
        get_folder_contents,
        handle_submit
    };
};