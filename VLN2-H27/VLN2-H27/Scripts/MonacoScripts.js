
require.config({ paths: { 'vs': '../../monaco/min/vs' } });

function changeTheme(theme, editor) {
    alert("dingus");
    var newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));
    editor.updateOptions({ 'theme': newTheme }); 
}

require(['vs/editor/editor.main'], function () {
    var editor = monaco.editor.create(document.getElementById('container'), {
        value: [
            'function x() {',
            '\tconsole.log("Hello world!");',
            '}'
        ].join('\n'),
        language: 'javascript'
    });

    $(".theme-picker").change(function () {
        changeTheme(this.selectedIndex, editor);
    });
});




