from flask import Flask, make_response, render_template, json
import pickle
import auth
import praw
import gzip
import os
import re

# rIMU, the reddit Inbox Management Utility for UpdateMeBot v0.5
# A small webapp that lets you manage your inbox
#
# Developed by J0hny007
#
# TODO: - Make this app a module
#       - Optimize the fetchInbox() function
#       - Implement inbox streaming
#       - Implement better error handling

reddit = praw.Reddit(
  client_id=auth.client_id,
  client_secret=auth.client_secret,
  username=auth.username,
  password=auth.password,
  user_agent="privon-dev",
  ratelimit_seconds=300
)


# loads cached message objects from file
def load_cache(file="./data/cache.pkl"):
  with open(file, "rb") as f:
    print("cache loaded")
    return pickle.load(f)


# caches all received messages to file
def save_cache(file="./data/cache.pkl", data=None):
  with open(file, "wb") as f:
    print("saving cache...")
    pickle.dump(data, f)
    print("cache saved")


# fetches all or specified number of messages from newest to oldest and returns it as a nested dict
# the PRAW Message object is saved under the "content" key
# the content of the message is saved behind the message.id key
def fetchInbox(limit=None):
  l_inbox = {}
  print("fetching inbox", end=" ")
  i = 0
  for message in reddit.inbox.messages(limit=limit):
    l_inbox[message.id] = {}
    l_inbox[message.id]["content"] = message
    l_inbox[message.id]["status"] = "read"
    if (i % 100) == 0:
      print(".", end="")
    i += 1
  print("\ndone.")
  return l_inbox


# fetches all or specified number of unread messages from reddit and updates the status in cache
# TODO: The range handling ist borked, plz fix
def fetchStatus(cache, limit=None):
  print("checking status ")
  if limit is None:  # TODO: Temporary Fix
    for s in cache:
      cache[s]["status"] = "read"
  i = 0
  for message in reddit.inbox.unread(mark_read=False, limit=limit):
    if message.id in cache:
      cache[message.id]["status"] = "unread"
    if (i % 100) == 0:
      print(".", end=".")
    i += 1
  print("\ndone.")
  return cache


# returns a list of message.ids for easier indexing and computing
def getIdList(cache):
  l_id_list = []
  for msg_id in cache:
    l_id_list.append(msg_id)
  return l_id_list


# fetches 50 new messages and merges the new ones with the cache dict and returns it
def appendNewMessages(cache):
  print("fetching new messages")
  new_msg = fetchInbox(limit=25)
  updated_cache = new_msg | cache
  save_cache(data=updated_cache)
  return updated_cache


# updates the status of a single message local and on reddit
# TODO: maybe implement trys for API and consistency errors
def updateStatus(msg_id, status, cache):
  print('setting \"status\" to \"' + status + '\"')
  if status == "unread":
    reddit.inbox.mark_unread([cache[msg_id]["content"]])
  elif status == "read":
    reddit.inbox.mark_read([cache[msg_id]["content"]])
  else:
    print("ERROR: no status provided!")
    return
  cache[msg_id]["status"] = status
  # l_chapters[msg_id]["status"] = status
  save_cache(data=cache)
  return cache


# gets message_body as input and searches for the title of the post
# the output of UpdateMeBot has inconsistencies over time, so I had to filter every permutation in my inbox
# and if no title is present, it gets its title from the reddit URL and formats it accordingly as a last resort
def extractTitle(message_body):
  new_title_pattern = r"(?<=\[\*\*)(.*?)(?=\*\*\])"
  old_title_pattern = r"(?<=\[)(.*?)(?=]\()"
  url_title_pattern = r"http(?:s)?://(?:www\.)?(?:[\w-]+?\.)?reddit.com(/r/|/user/)?(?(1)([\w:\.]{2,21}))(/comments/)?(\w{5,9})(/([\w%\\\\-]+))"

  # new format
  if title := re.search(new_title_pattern, message_body):
    return title.group()
  # old format
  if (title := re.search(old_title_pattern, message_body)) and (title.group() != "Click here"):
    return title.group()
  # fallback
  if title := re.search(url_title_pattern, message_body):
    c_title = title.group(6).replace("_", " ")
    c_title = c_title.title()
    if c_title.startswith("Pi "):
      c_title = c_title.replace("Pi", "[PI]")
    if c_title.startswith("Oc "):
      c_title = c_title.replace("Oc", "[OC]")
    if c_title.startswith("Wp "):
      c_title = c_title.replace("Wp", "[WP]")
    return c_title
  return "None"


# gets message_body as input and extracts the chapters author, title and link to the chapter (for reddit and Apollo)
# they will be returned as strings inside a nested dict
def extractBodyContent(message_body):
  author_pattern = r"u/[A-Za-z0-9_-]+"
  link_pattern = r"http(?:s)?://(?:www\.)?(?:[\w-]+?\.)?reddit.com(/r/|/user/)?(?(1)([\w:\.]{2,21}))(/comments/)?(?(3)(\w{5,9})(?:/[\w%\\\\-]+)?)?(?(4)/(\w{3,9}))?/?(\?)?(?(6)(\S+))?(\#)?(?(8)(\S+))?"
  author = re.search(author_pattern, message_body).group()
  title = extractTitle(message_body)
  r_link = re.search(link_pattern, message_body).group()
  a_link = r_link.replace("https", "apollo")
  return dict(author=author, title=title, r_link=r_link, a_link=a_link)


# extracts the authors from the chapter object and returns a list of all authors
def extractAuthors(l_chapters):
  authors = []
  for ch in l_chapters:
    if not l_chapters[ch]["author"] in authors:
      authors.append(l_chapters[ch]["author"])
  return authors


def extractUMBotMessages(cache):
  body_content = {}
  for c_msg in cache:
    if cache[c_msg]["content"].author == "UpdateMeBot":
      if re.search(r"(UpdateMeBot here!)", cache[c_msg]["content"].body):
        body_content[c_msg] = extractBodyContent(cache[c_msg]["content"].body)
        body_content[c_msg]["status"] = cache[c_msg]["status"]
  return body_content


def fetchCache(file="./data/cache.pkl"):
  if os.path.isfile(file):
    print("loading cache...")
    lc = load_cache()
  else:
    print("cache missing, retrieving inbox...")
    lc = fetchInbox()
    lc = fetchStatus(lc)
    save_cache(data=lc)
  return lc


app = Flask(__name__)
app.cache = fetchCache()
app.cache = fetchStatus(app.cache)
app.secret_key = auth.key


@app.route('/')
def index():
  app.cache = appendNewMessages(app.cache)
  app.cache = fetchStatus(app.cache, 50)
  return render_template("index.html")


@app.route('/inbox/<request>', methods=['GET'])
def inbox(request):
  if request == "reload":
    app.cache = appendNewMessages(app.cache)
  app.cache = fetchStatus(app.cache)
  # full_id_list = getIdList(loaded_cache)
  loaded_chapters = extractUMBotMessages(app.cache)
  id_list = getIdList(loaded_chapters)
  loaded_authors = extractAuthors(loaded_chapters)

  package = {
    "l_ch": loaded_chapters,
    "r_stat": dict(read="Unread", unread="Read"),         # this is so stupid
    "msg_id": id_list,
    "msg_count": len(id_list),
    "l_authors": loaded_authors}

  json_data = json.dumps(package).encode("utf8")          # oh boy, 800KB raw for ~3K messages
  zip_data = gzip.compress(json_data)                     # 100KB compressed... still yikes...
  response = make_response(zip_data)                      # yeah, I need to optimize here...
  response.headers['Content-Type'] = 'application/gzip'
  response.headers['Content-Encoding'] = 'gzip'
  return response                                         # I think sending 100KB every response is a tad wasteful


@app.route('/chapter/<string:chapter_id>/<string:action>')
def chapters(chapter_id, action):
  if "mark-" in action:
    app.cache = updateStatus(chapter_id, action.split("-")[1], app.cache)
  return json.jsonify(success=True)


if __name__ == '__main__':
  app.run(host='0.0.0.0')
