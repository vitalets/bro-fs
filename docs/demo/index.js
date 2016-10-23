
main();

function main() {
  if (!fs.isSupported()) {
    $('.main-row').hide();
    $('.alert-row').show();
  } else {
    addListeners();
    fs.init({type: window.TEMPORARY})
      .then(() => fs.clear())
      .then(() => fs.readdir('/', {deep: true}))
      .then(entries => !entries.length ? createInitialStructure() : entries)
      .then(entries => updateTree(null, entries))
      .then(() => $('#link-raw-fs').prop('href', fs.getRoot().toURL()));
  }
}

function createInitialStructure() {
  return Promise.all([
    fs.writeFile('react/index.js', 'console.log("hello world!")'),
    fs.mkdir('angular'),
    fs.mkdir('jquery'),
  ])
    .then(() => fs.readdir('/', {deep: true}))
}

function createTreeView(data) {
  const tree = $('#tree');
  if (tree.data('treeview')) {
    tree.treeview('remove');
  }
  tree
    .treeview({
      data: data,
      collapseIcon: 'glyphicon glyphicon-folder-open',
      expandIcon: 'glyphicon glyphicon-folder-close',
    })
    .on('nodeSelected', onSelected);
}

function makeTreeData(entries, selectedPath) {
  return entries.map(entry => {
    return {
      text: entry.name,
      entry: entry,
      icon: entry.isFile ? `glyphicon glyphicon-file` : '',
      state: {
        expanded: true,
        selected: entry.fullPath === selectedPath,
      },
      nodes: entry.children ? makeTreeData(entry.children, selectedPath) : null,
    };
  });
}

function onSelected(event, node) {
  const fileForm = $('#file');
  const dirForm = $('#directory');

  fileForm.toggle(node.entry.isFile);
  dirForm.toggle(!node.entry.isFile);

  if (node.entry.isFile) {
    $('#filename').val(node.text);
    fileForm.find('.direct-link').prop('href', node.entry.toURL());
    fs.readFile(node.entry.fullPath)
      .then(content => $('#content').val(content));
  } else {
    $('#dirname').val(node.text);
    dirForm.find('.direct-link').prop('href', node.entry.toURL());
    dirForm.find('#dirname, .save, .delete').prop('disabled', node.entry === fs.getRoot());
  }
}

function addListeners() {
  $('#file').on('submit', e => {
    e.preventDefault();
    const node = getSelected();
    fs.writeFile(node.entry.fullPath, $('#content').val())
      .then(() => rename(node, $('#filename').val()))
  });

  $('#file .delete').on('click', () => deleteSelected({isFile: true}));

  $('#directory').on('submit', e => {
    e.preventDefault();
    const node = getSelected();
    rename(node, $('#dirname').val());
  });

  $('#directory .delete').on('click', () => deleteSelected({isFile: false}));

  $('#directory .add-dir').on('click', () => {
    const node = getSelected();
    findFreeName(`${node.entry.fullPath}/folder_{i}`, 1)
      .then(path => fs.mkdir(path))
      .then(entry => updateTree(entry.fullPath));
  });

  $('#directory .add-file').on('click', () => {
    const node = getSelected();
    findFreeName(`${node.entry.fullPath}/file_{i}`, 1)
      .then(path => fs.writeFile(path, 'new file content'))
      .then(entry => updateTree(entry.fullPath));
  });
}

function getSelected() {
  return $('#tree').treeview('getSelected')[0];
}

function rename(node, newName) {
  if (node.text !== newName) {
    const newPath = node.entry.fullPath.split('/').slice(0, -1).concat([newName]).join('/');
    fs.rename(node.entry.fullPath, newPath)
      .then(() => updateTree(newPath));
  }
}

function deleteSelected({isFile}) {
  const node = getSelected();
  const parent = $('#tree').treeview('getParent', node);
  fs[isFile ? 'unlink' : 'rmdir'](node.entry.fullPath)
    .then(() => updateTree(parent.entry.fullPath))
}

function updateTree(selectedPath, entries) {
  return Promise.resolve()
    .then(() => entries || fs.readdir('/', {deep: true}))
    .then(entries => {
      const data = [{
        text: 'root',
        nodes: makeTreeData(entries, selectedPath),
        entry: fs.getRoot(),
        state: {
          expanded: true,
          selected: fs.getRoot().fullPath === selectedPath,
        },
      }];
      createTreeView(data);
      if (getSelected()) {
        onSelected(null, getSelected());
      }
    });
}

function findFreeName(tpl, i) {
  const path = tpl.replace('{i}', i);
  if (i === 99) {
    return Promise.resolve(path);
  }
  return fs.exists(path)
    .then(exists => exists ? findFreeName(tpl, i + 1) : path);
}
