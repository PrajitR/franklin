import sys
from random import shuffle

def process_file (filename):
  content = ''
  with open(filename, 'r') as content_file:
    content = content_file.read()

  return content.split('\n\n')

def get_answers (contents):
  content_pairs = []
  print 'For each function, enter what the code does (press enter to skip)\n\n'
  for func in contents:
    print func
    answer = raw_input('-> ')
    if answer:
      content_pairs.append((func, answer))
    print '\n'
  return content_pairs

def test (content_pairs):
  shuffle(content_pairs)
  correct, wrong = 0, 0

  print 'Press enter after each piece of code to see the answer\n'
  for (func, answer) in content_pairs:
    print func
    raw_input('')
    print 'Answer: ' + answer
    userCorrect = raw_input('Did you get it correct? (y/n) -> ')[0]
    while not (userCorrect == 'y' or userCorrect == 'n'):
      userCorrect = raw_input('Did you get it correct? (y/n) -> ')[0]
    
    if userCorrect == 'y': correct += 1
    else : wrong += 1
    
    print '\n'

  print ('\nYou got %d correct and %d wrong. Thats %.2f%% correct.') % \
        (correct, wrong, 100. * correct / len(content_pairs))

def run ():
  content_pairs = get_answers(process_file(sys.argv[1]))
  test(content_pairs)

if __name__ == '__main__':
  run()
