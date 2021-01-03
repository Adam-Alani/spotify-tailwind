<script >
    import App from "../App.svelte";
</script>

<main>
    <div class="flex flex-col h-screen">
        <div class="flex flex-1 overflow-y-hidden overflow-x-hidden">
            <div class="sideBar flex-none text-white justify-between flex flex-col font-semibold">
                <div>
                    <ul class="py-6 font-bold ml-2 playlists">
                        <li>
                            <a href="#" class="flex items-center mx-4 mt-4 group  ">
                                <svg class='group-hover:text-white '  xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="24" height="24"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
                                <span class="ml-3 group-hover:text-white">Home</span>
                            </a></li>
                        <li>
                            <a href="#" class="flex items-center mx-4 mt-4 group">
                                <svg  class='group-hover:text-white ' xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="24" height="24"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
                                <span class="group-hover:text-white ml-3">Search</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="flex items-center mx-4 mt-4 group">
                                <svg  class='group-hover:text-white ' xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="24" height="24"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
                                <span class=" group-hover:text-white ml-3">Your Library</span>
                            </a>
                        </li>
                    </ul>
                    <ul class="ml-2 playlists">
                        <li>
                            <a class="flex items-center mx-4 mt-4">
                                <h1 class="uppercase cursor-default">Playlists</h1>
                            </a>
                            <ul class="font-bold">
                                <li>
                                    <a href='#' class="flex items-center mx-4 mt-4 group">
                                        <svg class="group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"  width="24" height="24"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
                                        <span class="group-hover:text-white ml-4">Create Playlist</span>
                                    </a>
                                </li>
                                <li>
                                    <a href='#' class="flex items-center mx-4 mt-4 group">
                                        <svg  class="group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="24" height="24"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/></svg>
                                        <span class="group-hover:text-white ml-4">Liked Songs</span>
                                    </a>
                                </li>
                            </ul>

                        </li>
                    </ul>
                    <hr class="divider mt-4 m-auto">
                </div>
                <div class="scroll overflow-y-auto px-5 mt-4 ml-1">
                    <ul class="leading-loose playlists">
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Today’s Top Hits</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Global Top 50</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">RapCaviar</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Viva Latino</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Baila Reggaeton</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Songs to Sing in the Car</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Songs to Sing in the Shower</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">All Out 00s</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Rock Classics</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">All Out 80s</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Beast Mode</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">All Out 90s</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Chill Hits</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Hot Country</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Get Turnt</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Mood Booster</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">mint</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Esquenta Sertanejo</a></li>
                        <li class="truncate"><a href="#" class="hover:text-white font-normal">Happy Hits!</a></li>
                    </ul>
                </div>
                <div class="bottom h-16 px-4 py-1 flex items-center group ml-2 ">
                    <svg class="icon-color group-hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z"/></svg>
                    <a href='#' class="playlists ml-1 group-hover:text-white">Install App</a>
                </div>
            </div>
            <div class="mainScreen flex-1 flex flex-col text-white">
                <div class="flex items-center justify-between px-8 py-2">
                    <div class="py-2">
                        <button class="bg-black rounded-full">
                            <svg class="icon-color hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="34" height="34" ><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </button>
                        <button  class="bg-black rounded-full">
                            <svg class="icon-color hover:text-white" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="34" height="34" ><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/></svg>
                        </button>
                    </div>
                    <div class="flex items-center group bg-black rounded-full ">
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="34" height="34"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/></svg>
                        </button>
                        <a href="#" class="ml-2">xAtomicYT</a>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" width="34" height="34"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                        </button>
                    </div>
                </div>

                <div class="overflow-y-auto ">

                    <div class="mx-auto">
                        <div class="flex justify-between inline-block pt-2">
                            <a href="#" class="leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline">Shortcuts</a>
                            <a href="#" class="seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold">See All</a>
                        </div>
                        <div class="px-4" >
                            <div id="horiScroll" class="whitespace-nowrap overflow-x-scroll overflow-y-hidden">

                                <div class="inline-block  min-w-1/12 px-4 max-card rounded shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover0.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Sad Songs</a>
                                            <div class="playlists">I cry to this</div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover1.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Blond</a>
                                            <div class="playlists">Frank Ocean</div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover2.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Fine Line</a>
                                            <div class="playlists">Harry Styles</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-full shadow-md" src="covers/artist0.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold ">DJ Khaled</a>
                                            <div class="playlists">Artist</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover3.png" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold ">Wish You Were Here</a>
                                            <div class="playlists">Pink Floyd</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/12 px-4 max-card rounded shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover4.png" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">AM</a>
                                            <div class="playlists ">Arctic Monkeys</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="flex justify-between inline-block pt-8">
                            <a href="#" class="leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline">Recently played</a>
                            <a href="#" class="seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold">See All</a>
                        </div>
                        <div class="px-4 mr-4" >
                            <div id="horiScroll" class="  whitespace-nowrap overflow-x-scroll overflow-y-hidden">

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover0.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Sad Songs</a>
                                            <div class="playlists">I cry to this</div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover1.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Blond</a>
                                            <div class="playlists">Frank Ocean</div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover2.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Fine Line</a>
                                            <div class="playlists">Harry Styles</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-full shadow-md" src="covers/artist0.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold ">DJ Khaled</a>
                                            <div class="playlists">Artist</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover3.png" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold ">Wish You Were Here</a>
                                            <div class="playlists">Pink Floyd</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover4.png" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">AM</a>
                                            <div class="playlists ">Arctic Monkeys</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="flex justify-between inline-block pt-8">
                            <a href="#" class="leading-3 ml-8 text-2xl align-bottom inline-block font-bold hover:underline">Jump back in</a>
                            <a href="#" class="seemore def-color align-bottom mr-8 uppercase inline-block hover:underline font-bold">See All</a>
                        </div>
                        <div class="px-4 mr-4" >
                            <div id="horiScroll" class="  whitespace-nowrap overflow-x-scroll overflow-y-hidden">

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover0.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Sad Songs</a>
                                            <div class="playlists">I cry to this</div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover1.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Blond</a>
                                            <div class="playlists">Frank Ocean</div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover2.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">Fine Line</a>
                                            <div class="playlists">Harry Styles</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-full shadow-md" src="covers/artist0.jpg" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold ">DJ Khaled</a>
                                            <div class="playlists">Artist</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover3.png" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold ">Wish You Were Here</a>
                                            <div class="playlists">Pink Floyd</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="inline-block min-w-1/6 px-4 max-card rounded overflow-hidden shadow-lg my-2">
                                    <div class="card rounded-lg shadow-md">
                                        <div class="rounded-lg card-image">
                                            <a href="#" ><img class=" rounded-md shadow-md" src="covers/cover4.png" alt="cover"></a>
                                        </div>
                                        <div class="ml-5 pb-3 truncate" >
                                            <a href="#" class="font-bold">AM</a>
                                            <div class="playlists ">Arctic Monkeys</div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>

        <div class="bottomBar flex-none h-22 px-5 flex items-center justify-between">
            <div class="flex items-center">
                <a href="#"><img src="covers/cover5.jpg" class="w-12 h-12 shadow-lg"></a>
                <div class="ml-4 leading-none">
                <div><a href="#" class="hover:underline text-white">Here Comes the Sun</a></div>
                <div><a href="#" class="hover:underline hover:text-white playlists text-xs">The Beatles</a></div>
                </div>
            </div>


            <div class="flex flex-col justify-center">
                <div class="flex justify-center mt-1">
                    <button>
                        <svg class="fill-current playlists hover:text-white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" enable-background="new 0 0 512 512" version="1.1" viewBox="0 0 512 512" xml:space="preserve"><path d="M370.1,181.3H399v47.3l81-83.2L399,64v54h-28.9c-82.7,0-129.4,61.9-170.6,116.5c-37,49.1-69,95.4-120.6,95.4H32v63.3h46.9 c82.7,0,129.4-65.8,170.6-120.4C286.5,223.7,318.4,181.3,370.1,181.3z M153.2,217.5c3.5-4.6,7.1-9.3,10.7-14.1 c8.8-11.6,18-23.9,28-36.1c-29.6-27.9-65.3-48.5-113-48.5H32v63.3c0,0,13.3-0.6,46.9,0C111.4,182.8,131.8,196.2,153.2,217.5z M399,330.4h-28.9c-31.5,0-55.7-15.8-78.2-39.3c-2.2,3-4.5,6-6.8,9c-9.9,13.1-20.5,27.2-32.2,41.1c30.4,29.9,67.2,52.5,117.2,52.5 H399V448l81-81.4l-81-83.2V330.4z"/></svg>
                    </button>
                    <button class="ml-8">
                        <svg class="svg-color fill-current playlists hover:text-white" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 37 22"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g fill="#FF39AA" transform="translate(-709.000000, -286.000000)"><path d="M31.5350008,15.0036284 L17.8240107,7.18215392 C17.6148869,7.06285864 17.3771339,7 17.135042,7 C16.3797696,7 15.7675004,7.59886165 15.7675004,8.33759493 L15.7675004,15.0036284 L2.05651029,7.18215392 C1.8473865,7.06285864 1.60963353,7 1.36754162,7 C0.612269239,7 0,7.59886165 0,8.33759493 L0,27.0609378 C0,27.2977283 0.0642659496,27.5302749 0.186232067,27.7348193 C0.566738954,28.3729517 1.40409104,28.5885533 2.05651029,28.2163788 L15.7675004,20.3949043 L15.7675004,27.0609378 C15.7675004,27.2977283 15.8317664,27.5302749 15.9537325,27.7348193 C16.3342394,28.3729517 17.1715914,28.5885533 17.8240107,28.2163788 L31.5350008,20.3949043 L31.5350008,26.1462505 C31.5350008,27.3902719 32.5434794,28.3987505 33.7875009,28.3987505 C35.0315223,28.3987505 36.0400009,27.3902719 36.0400009,26.1462505 L36.0400009,9.25250006 C36.0400009,8.00847863 35.0315223,7 33.7875009,7 C32.5434794,7 31.5350008,8.00847863 31.5350008,9.25250006 L31.5350008,15.0036284 L31.5350008,15.0036284 Z" transform="translate(709.000000, 279.000000) translate(18.020000, 17.699375) scale(-1, 1) translate(-18.020000, -17.699375)"/></g></g></svg>
                    </button>
                    <button  class="ml-8">
                        <svg class="svg-color hover:text-white"  width="36" height="36" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </button >
                    <button  class="ml-8">
                        <svg class="svg-color fill-current playlists hover:text-white"  xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 36 22"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g fill="#FF39AA" transform="translate(-558.000000, -286.000000)"><path d="M17.8042278,7.18195175 C17.5953361,7.06278887 17.357847,7 17.1160238,7 C16.3615897,7 15.75,7.59819697 15.75,8.33611033 L15.75,14.9947452 L2.05422776,7.18195175 C1.84533608,7.06278887 1.607847,7 1.36602378,7 C0.61158968,7 0,7.59819697 0,8.33611033 L0,27.0386721 C0,27.2751998 0.0641946206,27.5074883 0.186025367,27.7118056 C0.566109929,28.3492298 1.40253263,28.564592 2.05422776,28.1928307 L15.75,20.3800372 L15.75,27.0386721 C15.75,27.2751998 15.8141946,27.5074883 15.9360254,27.7118056 C16.3161099,28.3492298 17.1525326,28.564592 17.8042278,28.1928307 L31.5,20.3800372 L31.5,26.125 C31.5,27.3676407 32.5073593,28.375 33.75,28.375 C34.9926407,28.375 36,27.3676407 36,26.125 L36,9.25 C36,8.00735931 34.9926407,7 33.75,7 C32.5073593,7 31.5,8.00735931 31.5,9.25 L31.5,14.9947452 L17.8042278,7.18195175 Z" transform="translate(558.000000, 279.000000)"/></g></g></svg>
                    </button>
                    <button  class="ml-8">
                        <svg class="svg-color fill-current playlists hover:text-white"  xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 36 30"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g fill="#FF39AA" fill-rule="nonzero" transform="translate(-256.000000, -282.000000)"><path d="M8.64,25.9710983 L19.2030566,25.9710983 C28.1531421,25.9710983 32.16,22.7468816 32.16,16 L36,16 C36,25.2145828 30.0888956,29.9710983 19.2030566,29.9710983 L8.64,29.9710983 L8.64,33 L5.68434189e-14,28 L8.64,23 L8.64,25.9710983 Z M27.36,10.0289017 L16.7969434,10.0289017 C7.84685788,10.0289017 3.84,13.2531184 3.84,20 L0,20 C0,10.7854172 5.91110441,6.02890173 16.7969434,6.02890173 L27.36,6.02890173 L27.36,3 L36,8 L27.36,13 L27.36,10.0289017 Z" transform="translate(256.000000, 279.000000)"/></g></g></svg>
                    </button>
                </div>
                <div class="flex items-center justify-center max-w-full mt-2 ">
                    <div class="text-xs playlists">0:00</div>
                    <div class="play-color rounded-lg w-full h-1 ml-3 xl:w-96"></div>
                    <div class="ml-2 text-xs playlists">3:48</div>
                </div>
            </div>
                <div class="flex items-center justify-center">
                    <button class="mb-1">
                        <svg class="svg-color" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 36 36"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g fill="#FF39AA" transform="translate(-860.000000, -465.000000)"><path d="M18.1946151,7.57330547 L33.8762935,7.57330547 C34.980863,7.57330547 35.8762935,8.46873597 35.8762935,9.57330547 C35.8762935,10.677875 34.980863,11.5733055 33.8762935,11.5733055 L16.2281832,11.5733055 L18.2729987,10.380719 C18.511274,10.241751 18.7095348,10.0434902 18.8485028,9.80521486 C19.2932826,9.04259295 19.0356206,8.06380048 18.2729987,7.61902071 L18.1946151,7.57330547 Z M3.87629351,33.5733055 C3.87629351,32.468736 4.77172401,31.5733055 5.87629351,31.5733055 L33.8762935,31.5733055 C34.980863,31.5733055 35.8762935,32.468736 35.8762935,33.5733055 C35.8762935,34.677875 34.980863,35.5733055 33.8762935,35.5733055 L5.87629351,35.5733055 C4.77172401,35.5733055 3.87629351,34.677875 3.87629351,33.5733055 Z M3.87629351,21.5733055 C3.87629351,20.468736 4.77172401,19.5733055 5.87629351,19.5733055 L33.8762935,19.5733055 C34.980863,19.5733055 35.8762935,20.468736 35.8762935,21.5733055 C35.8762935,22.677875 34.980863,23.5733055 33.8762935,23.5733055 L5.87629351,23.5733055 C4.77172401,23.5733055 3.87629351,22.677875 3.87629351,21.5733055 Z M15.1941076,9.9718314 L1.69199485,17.8465942 C1.15521659,18.1596565 0.466284754,17.9782988 0.153222525,17.4415205 C0.0528748417,17.2694638 0,17.0738525 0,16.8746712 L0,1.12514554 C0,0.503744818 0.503744818,0 1.12514554,0 C1.32432678,0 1.51993815,0.0528748417 1.69199485,0.153222525 L15.1941076,8.02798536 C15.7308858,8.34104759 15.9122435,9.02997943 15.5991813,9.56675769 C15.5013674,9.73446991 15.3618198,9.87401752 15.1941076,9.9718314 Z" transform="translate(860.000000, 465.000000)"/></g></g></svg>
                    </button>
                    <button class="ml-4">
                        <svg class="svg-color" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </button>
                    <button class="ml-4">
                        <svg class="svg-color" width="18" height="18" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    </button>
                    <div class="play-color rounded-lg w-24 h-1 ml-4"></div>

                </div>
        </div>
    </div>
</main>





<style>
    .play-color {
        background-color: #a7a7a7;
    }
    .max-card {
        max-width: 17rem;
    }
    .card-image {
        border-width: 1.25rem;
        border-color: #1b1b1b;
    }
    .card {
        background-color: #1b1b1b;
    }
    .seemore {
        font-size: 75%;
    }

    .icon-color {
        color: #a7a7a7;
    }
    ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
    }
    ::-webkit-scrollbar-button {
        width: 0px;
        height: 0px;
    }
    ::-webkit-scrollbar-thumb {
        background: #575757;
        border: 0px none #ffffff;
        border-radius: 0px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #adadad;
    }
    ::-webkit-scrollbar-thumb:active {
        background: #e3e3e3;
    }
    ::-webkit-scrollbar-track {
        background: #000000;
        border: 0px none #ffffff;
        border-radius: 0px;
    }
    ::-webkit-scrollbar-track:hover {
        background: #000000;
    }
    ::-webkit-scrollbar-track:active {
        background: #000000;
    }
    ::-webkit-scrollbar-corner {
        background: transparent;
    }

    .svg-color {
        filter: invert(73%) sepia(4%) saturate(0%) hue-rotate(289deg) brightness(91%) contrast(95%)
    }

    .playlists {
        color: #a7a7a7;
    }
    .def-color {
        color: #a7a7a7;
    }
    .divider {
        width: 11.5rem;
        border-color: #343434;
    }

    .mainScreen {
        background-color: #121212;
    }
    .sideBar {
        width: 14.5rem;
        background-color: black;
    }
    .bottomBar {
        height: 5.5rem;
        background-color: #282828;
    }


    #horiScroll::-webkit-scrollbar {
        width: 0px;
        height: 0px;
    }
    #horiScroll::-webkit-scrollbar-button {
        width: 0px;
        height: 0px;
    }
    #horiScroll::-webkit-scrollbar-thumb {
        background: #e1e1e1;
        border: 0px none #ffffff;
        border-radius: 0px;
    }
    #horiScroll::-webkit-scrollbar-thumb:hover {
        background: #ffffff;
    }
    #horiScroll::-webkit-scrollbar-thumb:active {
        background: #000000;
    }
    #horiScroll::-webkit-scrollbar-track {
        background: #666666;
        border: 0px none #ffffff;
        border-radius: 0px;
    }
    #horiScroll::-webkit-scrollbar-track:hover {
        background: #666666;
    }
    #horiScroll::-webkit-scrollbar-track:active {
        background: #333333;
    }
    #horiScroll::-webkit-scrollbar-corner {
        background: transparent;
    }


    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';
</style>
