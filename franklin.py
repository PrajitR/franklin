import sys
import os
from random import shuffle
from collections import defaultdict
import json

def process_project (filename):
  content = ''
  with open(filename, 'r') as content_file:
    content = content_file.read()

  return content.split('def ')

def get_answers (contents):
  content_pairs = []
  print '\n\nFor each function, enter what the code does (press enter to skip)\n\n'
  for func in contents:
    print func
    answer = raw_input('-> ')
    if answer:
      content_pairs.append((func, answer))
    print '\n'
  return content_pairs

def test_understanding (content_pairs):
  shuffle(content_pairs)
  correct, wrong = 0, 0

  print 'Press enter after each piece of code to see the answer\n'
  for (func, answer) in content_pairs:
    print func
    raw_input('')
    print 'Answer: ' + answer
    user_correct = raw_input('Did you get it correct? (y/n) -> ')[0]
    while not (userCorrect == 'y' or userCorrect == 'n'):
      user_correct = raw_input('Did you get it correct? (y/n) -> ')[0]
    
    if user_correct == 'y': correct += 1
    else: wrong += 1
    
    print '\n'

  print ('\nYou got %d correct and %d wrong. Thats %.2f%% correct.') % \
        (correct, wrong, 100. * correct / len(content_pairs))

def refactor (content_pairs):
  shuffle(content_pairs)
  content_trio = []

  print 'Given your definition of each function, write your own version of the function\n\n'
  for (func, answer) in content_pairs:
    split_func = func.split('\n')

    print '\n\nYour documentation: ' + answer
    print '\nFunction skeleton:'
    print split_func[0]
    print '\t...'
    print split_func[-1]
    print '\nYour version (^D to end):\n'

    refactored = sys.stdin.readlines()
    print '\n' + func
    content_trio.append((func, answer, '\n'.join(refactored)))

  for (func, answer, refactored) in content_trio:
    print '\n======================================'
    print func
    print '\n\n' + refactored

  return content_trio


def high_level_summary (root_dir=os.getcwd()):
  summaries, root_len = project_structure(root_dir)
  for dir_path, subdirs, files in os.walk(root_dir, topdown=False):
    if '.' in dir_path: continue # prevents .dirs like .git/

    print '\n\n============'
    print dir_path
    print '============'

    s = nested(dir_path.split('/')[root_len:], summaries)
    for f in files:
      if f[0] == '.': continue # prevents dotfiles like .gitignore or .foo.py.swp

      print '****' + f + '****'
      s[f] = raw_input('Your summary: ')
    s['dir_summary'] = raw_input('\nSummary of the subdirectory: ')

  print json.dumps(summaries, indent=2)
  return summaries

def project_structure (root_dir):
  project = {}
  root_len = len(root_dir.split('/')) - 1
  for dir_path, subdirs, files in os.walk(root_dir):
    if '.' in dir_path: continue
    dir_path = dir_path.split('/')[root_len:]
    nested_dict = nested(dir_path, project, exclude_last=True)
    nested_dict[dir_path[-1]] = {}
  return project, root_len

def nested (subdirs, p_dict, exclude_last=False):
  p = p_dict
  if exclude_last: subdirs = subdirs[:-1]
  for sd in subdirs:
    p = p[sd]
  return p

def run ():
  high_level_summary()

if __name__ == '__main__':
  run()
