    $(document).ready(function () {
        require.config({ paths: { 'vs': '../../Monaco/dev/vs' } });
        require(['vs/editor/editor.main'], function () {
            var editor = monaco.editor.create(document.getElementById('monaco-editor'),
                {
                    value: [
                        'function x() {',
                        '\tconsole.log("Hello world!");',
                        '}'
                    ].join('\n'),
                    //Hardcoded for now
                    language: 'javascript'
                });

            //Language modes
            var MODES = (function () {
                var modesIds = monaco.languages.getLanguages().map(function (lang) { return lang.id; });
                modesIds.sort();

                return modesIds.map(function (modeId) {
                    return {
                        modeId: modeId,
                        sampleURL: 'index/samples/sample.' + modeId + '.txt'
                    };
                });
            })();

            //Populate language list
            var startModeIndex = 0;
            for (var i = 0; i < MODES.length; i++) {
                var o = document.createElement('option');
                //like everywhere, default language is hardcoded
                if (MODES[i].modeId === 'javascript') {
                    startModeIndex = i;
                }
                o.textContent = MODES[i].modeId;
                $(".language-picker").append(o);
            }

            //Hardcoded for now, will need to be fetched later
            $(".language-picker")[0].selectedIndex = startModeIndex;

            $(".language-picker").change(function () {
                changeLanguage(MODES[this.selectedIndex], editor);
            });


            $(".theme-picker").change(function () {
                changeTheme(this.selectedIndex, editor);
            });
        });
    });

function changeTheme(theme, editor) {
    var newTheme = (theme === 1 ? 'vs-dark' : (theme === 0 ? 'vs' : 'hc-black'));
    editor.updateOptions({ 'theme': newTheme });
}

function changeLanguage(mode, editor) {
    var oldModel = editor.getModel();
    var newModel = monaco.editor.createModel(oldModel.getValue(), mode.modeId);

    editor.setModel(newModel);

    oldModel.dispose();
}
