using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VLN2_H27.Helpers
{
    public class openFile
    {
        private List<string> line;
        private int lineCount;
        private string filePath;

        public openFile(string filePath)
        {
            this.filePath = filePath;

            string[] fileLines = System.IO.File.ReadAllLines(filePath);
            line = fileLines.OfType<string>().ToList();
            lineCount = fileLines.Length;
        }

        public string getLine(int lineNumber)
        {
            return line[lineNumber];
        }

        public string getValue()
        {
            string fileValue = "";
            for(int i = 0; i < lineCount; i++)
            {
                fileValue += line[i] + '\n';
            }

            return fileValue;
        }

        public Boolean isThisFile(string filePath)
        {
            return this.filePath == filePath;
        }

        public void saveFile()
        {
            //TODO
        }

        public void updateFile(int updateMode, string text, int lineNumber, int pos)
        {
            if (updateMode == 0)
            {
                addText(text, lineNumber, pos);
            }
            else
            {
                removeAt(lineNumber, pos);
            }
        }

        private void addText(string text, int lineNumber, int pos)
        {
            line[lineNumber] = line[lineNumber].Insert(pos, text);
        }

        private void removeAt(int lineNumber, int pos)
        {
            line[lineNumber] = line[lineNumber].Remove(pos);
        }
    }
}