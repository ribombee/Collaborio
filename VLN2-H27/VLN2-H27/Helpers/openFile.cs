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
            if (lineCount != 0)
            {
                
                for (int i = 0; i < lineCount; i++)
                {
                    fileValue += line[i];
                }
                //fileValue += line[lineCount - 1];
            }

            return fileValue;
        }

        public Boolean isThisFile(string filePath)
        {
            return this.filePath == filePath;
        }

        public void saveFile()
        {
            System.IO.File.WriteAllLines(filePath, line.ToArray());
        }

        public void updateFile(int startColumn, int endColumn, int startLineNumber, int endLineNumber, string textValue)
        {
            if (startColumn >= endColumn)
            {
                addText(startColumn, endColumn, startLineNumber, endLineNumber, textValue);
            }
            else
            {
                removeAt(startColumn, endColumn, startLineNumber, endLineNumber);
            }
        }

        private void addText(int startColumn, int endColumn, int startLineNumber, int endLineNumber, string textValue)
        {
            if(startLineNumber == endLineNumber)
            {
                if (startLineNumber >= lineCount)
                {
                    line.Add(textValue);
                    lineCount++;
                }
                else
                {
                    if(startColumn == line[startLineNumber].Length)
                    {
                        line[startLineNumber] = line[startLineNumber] + textValue;
                    }
                    else
                    {
                        line[startLineNumber] = line[startLineNumber].Insert(startColumn, textValue);
                    }      
                }
            }
            else
            {
                String text = textValue;
                var textLines = text.Split('\n');

                if(startLineNumber >= lineCount)
                {
                    line.Add(textLines[0]);
                    lineCount++;
                }
                else
                {
                    if(startColumn == line[startLineNumber].Length)
                    {
                        line[startLineNumber] = line[startLineNumber] + textValue;
                    }
                    line[startLineNumber] = line[startLineNumber].Insert(startColumn, textLines[0]);
                }
                
                for(int i = 1; i < textLines.Length; i++)
                {
                    if (endLineNumber >= lineCount)
                    {
                        line.Add(textLines[startLineNumber+i]);
                        lineCount++;
                    }
                    else
                    {
                        line[startLineNumber + i] = line[startLineNumber + i].Insert(0, textLines[i]);
                    }
                }

                if (endLineNumber >= lineCount)
                {
                    line.Add(textLines[textLines.Length-1]);
                    lineCount++;
                }
                else
                {
                    line[endLineNumber] = line[startLineNumber].Insert(0, textLines[textLines.Length-1]);
                }
            }
            
        }

        private void removeAt(int startColumn, int endColumn, int startLineNumber, int endLineNumber)
        {
            if (startLineNumber == endLineNumber)
            {
                line[startLineNumber] = line[startLineNumber].Remove(startColumn, endColumn-startColumn);
            }
            else
            {
                line[startLineNumber] = line[startLineNumber].Remove(startColumn);
                for (int i = startLineNumber + 1; i < endLineNumber; i++)
                {
                    line[i] = line[i].Remove(0);
                }
                line[endLineNumber] = line[endLineNumber].Remove(0, endColumn);
            }
            
        }
    }
}