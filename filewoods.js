class FileWoods {

    static valid_file_name_regex = /^[^\\/:*?"<>|]+$/;
    static directory_separator = '/';
    static fw_file = 'file';
    static fw_dir = 'folder';
    static fw_common_item_class = 'fw-item';
    static fw_selected_item_class = 'fw-selected-item';
    static fw_no_files_html = `<div class="fw-no-files-icon">📁</div>
    <h4 class="fw-no-files-text">Nothing to see here!</h4>
    <span class="fw-no-files-subtext">The location you tried to open is either empty or invalid </span>`;
    static is_valid_file_name = (filename) => FileWoods.valid_file_name_regex.test(filename);
    static make_abs_path = (path) => FileWoods.directory_separator + path.split(FileWoods.directory_separator).filter((name) => name.trim().length).join(FileWoods.directory_separator);
    static is_valid_regex = (s) => {
        let valid = true;
        try {
            new RegExp(s);
        } catch(e) {
            valid = false;
        }
        return valid;
    }

    is_file = (abs_path) => this.#file_list.hasOwnProperty(abs_path) && this.#file_list[abs_path].type === FileWoods.fw_file;
    is_dir = (abs_path) => abs_path === FileWoods.directory_separator || (this.#file_list.hasOwnProperty(abs_path) && this.#file_list[abs_path].type === FileWoods.fw_dir);
    dir_name = (abs_path, levels = 1) => {

        return new Promise((resolve) => {

            let path = FileWoods.make_abs_path(abs_path).split(FileWoods.directory_separator);

            for (let index = 0; index < levels; index++) {
                path.pop();
            }

            resolve(path.join(FileWoods.directory_separator));

        })


    }

    basename = (abs_path) => abs_path.split(FileWoods.directory_separator).filter((name) => name.trim().length).pop();

    build_element(details) {

        const el = document.createElement(details.name);
        el.classList.add(...(details.classes || []));

        Object.keys(details.attr || {}).forEach((at) => {
            el.setAttribute(at, details.attr[at]);
        });


        if (details.text) {
            el.textContent = details.text;
        }

        if (details.html) {
            el.innerHTML = details.html;
        }

        return el;

    }

    render_empty_location() {
        this.main_element.classList.add('fw-center');
        this.main_element.innerHTML = FileWoods.fw_no_files_html;
    }

    clear_main_element() {
        this.main_element.classList.remove('fw-center');
        this.main_element.innerHTML = '';
    }

    start_loader(element) {
        if (!element.classList.contains('fw-loader')) {
            element.classList.add('fw-loader');
        }
    }

    finish_loader(element) {
        element.classList.remove('fw-loader');
    }

    open_search = () => {
        this.search_bar_container.classList.remove('fw-search-container-closed');
        this.search_input.focus()
    }

    close_search = () => {
        this.search_bar_container.classList.add('fw-search-container-closed');
    }

    render_search_results = () => {

        const q = this.search_input.value;

        const options = {
            regex: false,
            match_case: this.search_option_matchcase.checked
        }

        if( this.search_option_regex.checked ){
            
            if( FileWoods.is_valid_regex(q) ){

                options.regex = true;
                this.search_field.removeAttribute('data-fw-tooltip')

            } else {

                this.search_field.setAttribute('data-fw-tooltip' , 'invalid regex')
                options.regex = false

            }

        }

        this.search_results_field.innerHTML = '';

        console.log(this.#file_list);

        this.get_search_result( q , options ).forEach( single_path => {

            var single_file_element = this.get_file_element( this.#file_list[single_path] , false );
            single_file_element.addEventListener('dblclick', () => { this.node_open_callback(this.#file_list[single_path]) });

            // if (this.#file_list[single_path].type === FileWoods.fw_dir) {
                single_file_element.addEventListener('dblclick',  () => {
                     this.close_search();
                     this.go_to(single_path);
                });
            // }
            
            this.search_results_field.appendChild(single_file_element);

            console.log(single_path , this.#file_list[single_path].abs_path);

        });

    }

    get_search_result = (q , options) => {


        let results = [];

        if( options.regex ) {

            if( FileWoods.is_valid_regex(q) ){
                
                results.push( ...this.regex_search(new RegExp(q)));

            }

        }

        results.push( ...Object.keys(this.#file_list).filter( f => {

            if( options.match_case ){
                return this.basename(f).includes(q)
            } else {
                return this.basename(f).toLowerCase().includes(q.toLowerCase());
            }

        } ) )

        return results;
    }

    regex_search = regex => Object.keys(this.#file_list).filter( f => regex.test(this.basename(f)) );
    

    #file_list = {};
    location_stack = [];
    current_location = FileWoods.directory_separator;

    #current_rendered_list = {
        paths: [],
        focus_at: -1
    };

    // is_focused = () => this.#current_rendered_list.focus_at in this.#current_rendered_list.paths;

    constructor(main_element, details) {

        if (!(main_element instanceof HTMLElement)) {
            throw new Error('Invalid argument. argument #1 of FileWoods must be an html element');
        }

        if (typeof details !== 'object') {
            throw new Error('Invalid argument. argument #2 of FileWoods must be an object');
        }

        if (typeof details.tree === 'object') {
            this.tree = details.tree;
        } else {
            throw new Error(`the tree property has to be an object ( ${typeof details.tree} found )`);
        }

        if (typeof details.node_open_callback === 'function') {
            this.node_open_callback = details.node_open_callback;
        } else {
            this.node_open_callback = () => { };
        }




        //making title bar
        const title_bar_main = document.createElement('div');
        title_bar_main.classList.add('fw-title-bar');

        this.back_button = this.build_element({
            name: 'button',
            classes: ['fw-back-button'],
            text: 'Back'
        });

        this.back_button.addEventListener('click', () => { this.go_back() } );

        this.bread_crumbs_container = this.build_element({
            name: 'ol',
            classes: ['fw-breadcrumb']
        });

        const options_container = this.build_element({
            name: 'div',
            classes: ['fw-options-container']
        });

        const options_button = this.build_element({
            name: 'button',
            classes: ['fw-options-button'],
            text: 'Options'
        });

        this.options_list_element = this.build_element({
            name: 'ul',
            classes: ['fw-option-items'],
            text: 'Options'
        });
        this.options_list_element = document.createElement('ul');
        this.options_list_element.classList.add('fw-option-items');

        this.hidden_search_input = this.build_element({
            name: 'input',
            attr: {
                type: 'text'
            }
        });

        this.#render_options([
            {
                name: 'search',
                callback: this.open_search,
                attributes: {
                    'data-attr': 'attr'
                }
            }
        ]);

        options_container.append(options_button, this.options_list_element)

        //making main action area
        this.main_element = this.build_element({
            name: 'div',
            classes: ['fw-files-list'],
        });
        // this.main_element = document.createElement('div');
        // this.main_element.classList.add('fw-files-list');


        title_bar_main.append(this.back_button, this.bread_crumbs_container, options_container);

        this.search_bar_container = this.build_element({
            name: 'div',
            classes: ['fw-search-container', 'fw-search-container-closed'],
        });

        this.search_field = this.build_element({
            name: 'div',
            classes: ['fw-search-field'],
        });

        this.search_input = this.build_element({
            name: 'input',
            classes: ['fw-search-input'],
            attr: {
                type: 'text',
                placeholder: "Search here"
            }
        });

        this.search_input.oninput = this.render_search_results;

       
        //option regex
        const regex_field = this.build_element({
            name: 'div',
            classes: ['fw-search-option-field'], 
        })

        this.search_option_regex = this.build_element({
            name: 'input',
            classes: ['fw-search-input'],
            attr: {
                type: 'checkbox',
                id: 'fw-search-option-regex',
            }
        });

        this.search_option_regex.onchange = this.render_search_results;


        const regex_label = this.build_element({
            name:'label',
            attr: {
                for:'fw-search-option-regex',
                title: 'RegEx Search',
                tabindex : 0
            },
            text:"RegEx"
        })

        regex_field.append( this.search_option_regex , regex_label );

        //option case
        const match_case_field = this.build_element({
            name: 'div',
            classes: ['fw-search-option-field'],  
        })

        this.search_option_matchcase = this.build_element({
            name: 'input',
            classes: ['fw-search-input'],
            attr: {
                type: 'checkbox',
                id: 'fw-search-option-matchcase',
            }
        });

        this.search_option_matchcase.onchange = this.render_search_results;


        const match_case_label = this.build_element({
            name:'label',
            attr: {
                for:'fw-search-option-matchcase',
                title: 'Case Sensitive Seach',
                tabindex : 0 
            },
            text:"Aa"
        })

        match_case_field.append( this.search_option_matchcase , match_case_label );
        

       
        this.search_results_field = this.build_element({
            name: 'div',
            classes: ['fw-search-results'],
        });

        this.search_close_button = this.build_element({
            name: 'button',
            classes: ['fw-close-search-button'],
            html: '&#x2715;'
        });

        this.search_close_button.onclick = this.close_search;


        this.search_field.append(this.search_input , regex_field , match_case_field)
        this.search_bar_container.append(this.search_field, this.search_results_field, this.search_close_button)


        main_element.append(title_bar_main, this.main_element, this.search_bar_container);

        this.root_element = main_element;
        this.root_element.classList.add('fw-root-element');


        this.sort_by = Array.isArray(details.sort_by) ? details.sort_by : [];
        this.pinning = typeof details.pin === 'boolean' && details.pin === true;

        this.#file_list = this.tree_to_list(this.tree);

        this.#render_location(this.current_location);

        if( details.keyboard_shortcuts ) {

            let typing = false;
            window.addEventListener('keypress', (e) => {
    
                if (document.activeElement === document.body && /^.$/u.test(e.key)) {
                    typing = true;
    
                    this.hidden_search_input.value += e.key;
    
                    const index = this.#current_rendered_list.paths.findIndex(el => this.basename(el).toLowerCase().startsWith(this.hidden_search_input.value.toLowerCase()));
                    this.#current_rendered_list.focus_at = index === -1 ? this.#current_rendered_list.focus_at : index;
                    this.#highlight_item_at_focus();
    
                    typing = false;
                }
    
            })
    
            setInterval(() => {
                if (!typing) {
                    this.hidden_search_input.value = '';
                }
            }, 1000);
    
            window.onkeydown = (e) => {
    
                const code = (e.keyCode ? e.keyCode : e.which);
    
                if (code === 38) {//up key
                    this.#move_keyboard_cursor(-1);
                } else if (code === 40) { //down key
                    this.#move_keyboard_cursor(1);
                } else if (e.shiftKey && code === 13) {
                    this.go_back();
                } else if (code === 13 && document.activeElement && document.activeElement.isFileWoodsItem ) {
                    
                    this.go_to(document.activeElement.FileWoods_abs_path);

                }
    
            }
    
            window.addEventListener('click', (e) => {
    
                //there is a problem with doing this
                //that some other click listeners run before this and this cancels out there work so have to solve it
                if (!this.root_element.contains(e.target)) {
                    this.#current_rendered_list.focus_at = -1;
                    this.#highlight_item_at_focus();
                }
            });

        }

    }




    tree_to_list(tree, current_parent = FileWoods.directory_separator) {

        let list = {};

        Object.values(tree).forEach(element => {

            if (!FileWoods.is_valid_file_name(element.name)) {
                throw new Error(`Invalid filename. Filename cannot contain special characters like \\ / : * ? " < > | ( checking ${element.name} )`);
            }

            let this_parent = FileWoods.make_abs_path(current_parent + FileWoods.directory_separator + element.name);

            list[this_parent] = {
                basename: element.name,
                type: FileWoods.fw_file === element.type.toLowerCase() ? FileWoods.fw_file : FileWoods.fw_dir,
                is_active: element.hasOwnProperty('active') ? element.active == true : true,
                abs_path: this_parent
            }

            if (this.pinning && typeof element.pinned === 'boolean') {
                list[this_parent].pinned = element.pinned;
            }

            this.sort_by.forEach((srt) => {
                list[this_parent][srt] = element[srt];
            });


            if (list[this_parent].type === FileWoods.fw_dir && typeof element.children === 'object') {
                list = { ...list, ...this.tree_to_list(element.children, this_parent) };
            }

            ['name', 'type', 'active', 'children'].forEach(el => { delete element[el] });

            list[this_parent] = { ...list[this_parent], ...element };

        });

        return list;

    }

    get_file_element( details_object, highlighted = false ) {

        // const details_copy = details_object;

        const main = document.createElement('div');
        main.classList.add(FileWoods.fw_common_item_class, details_object.type === FileWoods.fw_dir ? 'fw-folder' : 'fw-file');
        if (highlighted) {
            main.classList.add('fw-highlight-animation');
        }
        main.tabIndex = 0;

        if (typeof details_object.attributes === 'object') {
            Object.keys(details_object.attributes).forEach((attr) => {
                main.setAttribute(attr, details_object.attributes[attr]);
            });
        }

        delete details_object.attributes;

        Object.keys(details_object).forEach((attr) => {
            main.setAttribute(attr, details_object[attr]);
        });

        const icon_element = document.createElement('span');

        icon_element.classList.add(details_object.type === FileWoods.fw_dir ? 'fw-folder-icon' : 'fw-file-icon');

        const name_element = document.createElement('span');
        name_element.textContent = details_object.basename;

        main.appendChild(icon_element);
        main.appendChild(name_element);

        main.isFileWoodsItem = true;
        main.FileWoods_abs_path = details_object.abs_path;

        return main;
    }

    get_children(abs_path, level = 1) {

        return new Promise((resolve) => {
            const levels_from_root = abs_path.split(FileWoods.directory_separator).filter((name) => name.trim().length).length;
            resolve(Object.keys(this.#file_list).filter((this_path) => this_path.startsWith(abs_path) && abs_path !== this_path && this_path.split(FileWoods.directory_separator).filter((name) => name.trim().length).length - levels_from_root <= level));
        });

    }

    #render_options(items) {

        this.options_list_element.innerHTML = '';

        items.forEach(item => {
            const liElement = document.createElement('li');
            const aElement = document.createElement('a');

            aElement.textContent = item.name;

            if (typeof item.attributes === 'object') {
                Object.keys(item.attributes).forEach((attr) => {
                    liElement.setAttribute(attr, item.attributes[attr]);
                });
            }

            aElement.href = 'javascript:;';
            aElement.onclick = item.callback;

            liElement.classList.add('fw-option-item');
            liElement.appendChild(aElement);
            this.options_list_element.appendChild(liElement);

        });
    }

    #render_breadcrumbs(location = null) {

        if (location === null) {
            location = this.current_location;
        }

        this.bread_crumbs_container.innerHTML = '';

        const paths = location.split('/').filter(path => path.trim() !== ''); // Split the file path and remove empty parts
        paths.unshift('/')

        let full_path = '';

        paths.forEach((path) => {

            full_path += `/${path}`;

            const listItem = document.createElement('li');
            const link = document.createElement('span');
            link.setAttribute('data-location', FileWoods.make_abs_path(full_path));

            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.go_to(FileWoods.make_abs_path(e.target.getAttribute('data-location')))
            });

            link.textContent = path;
            listItem.append(link);

            this.bread_crumbs_container.append(listItem);
        });

    }

    async #render_location(location) {

        return new Promise((resolve) => {

            this.clear_main_element();
            let files_to_render = [];

            const populate_list_with_children = (files_to_render) => {

                this.#current_rendered_list.paths = files_to_render;
                this.#current_rendered_list.focus_at = 0;

                if (files_to_render.length) {

                    const is_file = this.is_file(location);

                    let i = 0;
                    for (let single_path of files_to_render) {

                        this.#file_list[single_path].abs_path = single_path;

                        var single_file_element = this.get_file_element(this.#file_list[single_path], location === single_path);

                        single_file_element.addEventListener('dblclick', () => { this.node_open_callback(this.#file_list[single_path]) });
                        // single_file_element.addEventListener('click', () => { this.#select_item_by_index(i) });
                        if (this.#file_list[single_path].type === FileWoods.fw_dir) {
                            // single_file_element.addEventListener('dblclick', async () => { await this.go_to(this.#file_list[single_path].abs_path) });
                            single_file_element.addEventListener('dblclick', async () => { await this.go_to(single_path) });
                        }

                        this.main_element.appendChild(single_file_element);


                        if (is_file && location === single_path) {
                            this.#current_rendered_list.focus_at = i;
                        }

                        i++;
                    }

                    this.#highlight_item_at_focus();

                } else {

                    this.render_empty_location();

                }

                resolve();

            }

            if (this.is_dir(location)) {

                this.get_children(location).then(children => {

                    populate_list_with_children(children);
                    this.#render_breadcrumbs(location);

                });

            } else if (this.is_file(location)) {

                this.dir_name(location).then(dn => {
                    this.get_children(dn).then(children => {
                        populate_list_with_children(children);
                        this.#render_breadcrumbs(dn);
                    });
                })

            }

        })





    }



    #move_keyboard_cursor(move_to) {

        this.#current_rendered_list.focus_at += move_to;

        if (this.#current_rendered_list.focus_at > this.#current_rendered_list.paths.length - 1) {
            this.#current_rendered_list.focus_at = -1;
        } else if (this.#current_rendered_list.focus_at < 0) {
            this.#current_rendered_list.focus_at = this.#current_rendered_list.paths.length;
        }

        this.#highlight_item_at_focus();

    }

    #highlight_item_at_focus() {

        this.main_element.querySelectorAll(`.${FileWoods.fw_common_item_class}`).forEach((element, index) => {

            if (this.#current_rendered_list.focus_at === index) {
                // element.classList.add(FileWoods.fw_selected_item_class);
                element.focus();
            } else {
                // element.classList.remove(FileWoods.fw_selected_item_class);
                element.blur();
            }

        });

    }

    #select_item_by_index(index) {

        index = Number(index);

        this.#current_rendered_list.focus_at = index;

        this.#highlight_item_at_focus();

    }

    async go_to(location = FileWoods.directory_separator) {

        this.start_loader(this.root_element);

        location = FileWoods.make_abs_path(location);

        await this.#render_location(location)

        this.location_stack.push(this.current_location);
        this.current_location = location;
        this.finish_loader(this.root_element);
    }

    async go_back() {

        this.start_loader(this.root_element);

        let go_to = this.location_stack.pop();

        if (go_to === undefined) {
            go_to = FileWoods.directory_separator;
        }

        await this.#render_location(go_to);
        this.finish_loader(this.root_element);
        this.current_location = go_to;

    }





}