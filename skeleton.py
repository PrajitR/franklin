import sys
import json
import os
import fnmatch
import itertools
from collections import defaultdict

def generate_structure (root_dir=os.getcwd()):
  check_ignore = check_in_gitignore(get_gitignore())
  struc = defaultdict(lambda: {})
  for dirpath, dirnames, filenames in os.walk(root_dir):
    if not valid_dir(dirpath): continue
    dirpath = dirpath[len(root_dir):] + '/'
    dirnames = (d + '/' for d in dirnames if valid_dir(d) and not check_ignore(d))
    filenames = (f for f in filenames if not check_ignore(f))

    for d in itertools.chain(dirnames, filenames):
      struc[dirpath][d] = { 'description': '', 'next': [], 'entry_point': False }
          
  return struc

def get_gitignore ():
  gitignore = os.path.join(os.getcwd(), '.gitignore')
  if not os.path.isfile(gitignore): return
  with open(gitignore, 'r') as f:
    ignore = [(line.rstrip('\r\n')) for line in f if len(line) > 1 and line[0] != '#']
    return ignore

def check_in_gitignore (ignore):
  def check (f):
    return any((fnmatch.fnmatch(f, i) for i in ignore))
  return check

def valid_dir (d):
  restricted = ['.git/']
  return not any(inv in d for inv in restricted)

if __name__ == '__main__':
  file_name, root_dir = 'franklin.json', os.getcwd()
  for i in xrange(1, len(sys.argv), 2):
    option = sys.argv[i]
    if option == '-p' or option == '--projectpath':
      root_dir = sys.argv[i + 1]
    elif option == '-o' or option == '--output':
      file_name = sys.argv[i + 1]

  if os.path.isfile(file_name):
    r = raw_input(file_name + ' already exists! Do you want to continue? (y/n)')
    if r[0] != 'y' or r[0] != 'Y':
      return

  with open(file_name, 'w') as f:
    json.dump(generate_structure(root_dir), f)
