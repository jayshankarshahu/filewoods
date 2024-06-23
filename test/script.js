const file_tree = [
    {
        name: 'Folder 1',
        type: 'folder',
        time_created: 1648876800, // Example epoch time for creation
        time_modified: 1648876800, // Example epoch time for modification
        created_by: 'user123', // Example username
        children: [
            {
                name: 'Subfolder 1',
                type: 'folder',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
                children: [
                    {
                        name: 'Subfolder 1-1',
                        type: 'folder',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    },
                    {
                        name: 'File 1-1',
                        type: 'file',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    },
                    {
                        name: 'File 1-2',
                        type: 'file',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    }
                ]
            },
            {
                name: 'Subfolder 2',
                type: 'folder',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
                children: [
                    {
                        name: 'File 2-1',
                        type: 'file',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    },
                    {
                        name: 'File 2-2',
                        type: 'file',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    }
                ]
            },
            {
                name: 'File 1',
                type: 'file',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
            },
            {
                name: 'File 2',
                type: 'file',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
            }
        ]
    },
    {
        name: 'Folder 2',
        type: 'folder',
        time_created: 1648876800,
        time_modified: 1648876800,
        created_by: 'user123',
        children: [
            {
                name: 'Subfolder 3',
                type: 'folder',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
                children: [
                    {
                        name: 'File 3-1',
                        type: 'file',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    },
                    {
                        name: 'File 3-2',
                        type: 'file',
                        time_created: 1648876800,
                        time_modified: 1648876800,
                        created_by: 'user123',
                    }
                ]
            },
            {
                name: 'File 2-1',
                type: 'file',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
            },
            {
                name: 'File 2-2',
                type: 'file',
                time_created: 1648876800,
                time_modified: 1648876800,
                created_by: 'user123',
            }
        ]
    },
    {
        name: 'File 3',
        type: 'file',
        time_created: 1648876800,
        time_modified: 1648876800,
        created_by: 'user123',
    },
    {
        name: 'File 4',
        type: 'file',
        time_created: 1648876800,
        time_modified: 1648876800,
        created_by: 'user123',
    }
];





const fw = new FileWoods(document.querySelector('#main'), { tree: file_tree , node_open_callback : (details) => { } , keyboard_shortcuts : false });
