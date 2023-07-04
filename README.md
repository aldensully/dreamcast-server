# dreamcast-server
This server is heavily dependent on nodeshout, which is an older and less maintained package. 
In order to use nodeshout you MUST have libshout installed on the system. Libshout is the client used to stream audio to icecast. Libshout can be wonky, in order to install it on your system you must make sure you have libogg and libvorbis installed first, and most importantly you MUST build it from source, not with a package manager, at least on osx.

https://github.com/xiph/Icecast-libshout/blob/master/INSTALL for libshout install directions
https://icecast.org/download/ go to bottom of page to find libshout install. Run ./configure, then make, then make install, you should be good.

For osx, make sure you see libshout.dylib under usr/local/lib. This is a requirement for ffi-napi, a dependency used for dynamic linking for nodeshout.
