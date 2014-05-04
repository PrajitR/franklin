import sys
import json
import os
import itertools
from collections import defaultdict

def generate_structure (root_dir=os.getcwd()):
  struc = defaultdict(lambda: {})
  for dirpath, dirnames, filenames in os.walk(root_dir):
    if not valid_dir(dirpath): continue
    dirpath = dirpath[len(root_dir):] + '/'
    dirnames = (d + '/' for d in dirnames if valid_dir(d))
    filenames = (f for f in filenames if valid_file(f))

    for d in itertools.chain(dirnames, filenames):
      struc[dirpath][d] = { 'description': '', 'next': [], 'entry_point': False }
          
  return struc

def valid_dir (d):
  restricted = ['.', 'node_modules']
  return not any(inv in d for inv in restricted)

def valid_file (f):
  restricted = ['.swp']
  return not any(inv in f for inv in restricted)

if __name__ == '__main__':
  file_name = sys.argv[1] or 'franklin.json'  
  with open(file_name, 'w') as f:
    json.dump(generate_structure(), f)
