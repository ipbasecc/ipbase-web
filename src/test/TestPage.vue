<template>
    <q-layout view="hHh lpR fFf">
        <q-header class="bg-black text-white">
            <q-toolbar class="gap-sm">
                <q-toolbar-title> Title </q-toolbar-title>
                <q-space />
                <q-btn color="primary" no-caps label="Find" />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="q-pa-md">

            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script setup>
    import { onMounted, ref, watch, computed, watchEffect } from 'vue';
    import { io } from "socket.io-client";
    import { uiStore } from "src/hooks/global/useStore.js";

    import { useQuasar } from 'quasar'
    const $q = useQuasar()
    const jwt = JSON.parse(localStorage.getItem('jwt'));
    onMounted(() => {
        uiStore.pageLoaded = true;
    });

    // URL to your strapi instance
    const SERVER_URL = process.env.BACKEND_URI;
    // generated token returned after sign in
    const JWT_TOKEN = jwt;
    console.log('JWT_TOKEN', JWT_TOKEN);

    // const socket = io(SERVER_URL);
    // connect the socket
    const socket = io(SERVER_URL, {
        auth: {
            strategy: 'jwt',
            token: JWT_TOKEN,
        },
    });

    //  wait until socket connects before adding event listeners
    socket.on('connect', () => {
        socket.on('todo:create', (data) => {
            console.log('article created!');
            console.log(data);
        });
        socket.on('todo:update', (data) => {
            console.log('article updated!');
            console.log(data);
        });
        socket.on('todo:delete', (data) => {
            console.log('article deleted!');
            console.log(data);
        });
        socket.on('todo:delete', (data) => {
            console.log('article deleted!');
            console.log(data);
        });
    });
</script>