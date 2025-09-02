# fix for Threads not found when building for iOS
# ref: https://stackoverflow.com/questions/54587052/cmake-on-mac-could-not-find-threads-missing-threads-found
if(APPLE)
    set(CMAKE_THREAD_LIBS_INIT "-lpthread")
    set(CMAKE_USE_WIN32_THREADS_INIT 0)
    set(CMAKE_USE_PTHREADS_INIT 1)
    set(THREADS_PREFER_PTHREAD_FLAG ON)
    set(CMAKE_HAVE_THREADS_LIBRARY 1)
endif()
