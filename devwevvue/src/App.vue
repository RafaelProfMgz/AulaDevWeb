<script setup>
import BackgroundAnimation from "./components/BackgroundAnimation.vue";
import List from "./components/List.vue";
</script>

<template>
    <BackgroundAnimation
        :star-count="1200"
        star-color="rgba(220, 220, 255, 0.85)"
        background-color="linear-gradient(to bottom, #010110, #101030)"
    />

    <div class="main-content">
        <List />
    </div>
</template>

<style scoped>
/* Estilos estão corretos para o propósito */
.main-content {
    position: relative;
    z-index: 1;
    padding-top: 10vh;
    min-height: 100vh; /* Garante que o container ocupe a altura */
    box-sizing: border-box; /* Para padding não aumentar a altura total */
}
</style>
