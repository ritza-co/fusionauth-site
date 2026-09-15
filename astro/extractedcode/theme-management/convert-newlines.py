import sys

OUTPUT = sys.stdin.read()
formatted_output = OUTPUT.replace('\\n', '\n')
print(formatted_output)
