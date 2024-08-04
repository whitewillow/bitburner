# Threads

Just to be clear, threads and cores have almost nothing to do with each other.

All cores do is increase the strength of the ns.grow() and ns.weaken() methods, meaning that more cores means that you'll need to use less threads to do the same amount of growing and weakening. (Note: Cores do not affect ns.hack().)

As for threads, you can have as many threads running on a server as the RAM supports, regardless of the number of cores. All threads do is multiply a script's RAM usage as well as multiplying the strength of the ns.grow(), ns.weaken(), and ns.hack() methods.

They don't affect anything else.

See https://www.reddit.com/r/Bitburner/comments/1eg6h0c/question_about_threads/


To avoid black screen with high thread counts, I do 3 things. 1. Place a sleep between batches. 2. Place a small sleep at an interval while launching threads. 3. Add extra ms to the h/w/g threads if weaken time is too low, so the last threads aren't launching while the first threads are landing. Doing this I got over 1m threads launched and landed, but I use a limit of 250k threads normally.