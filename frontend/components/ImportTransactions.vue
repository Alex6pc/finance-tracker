<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTransactionsStore } from '~/stores/transactions';

const transactionsStore = useTransactionsStore();

const isUploading = ref(false);
const isDragging = ref(false);
const fileName = ref('');
const uploadProgress = ref(0);
const successMessage = ref('');
const errorMessage = ref('');

// Handle file selection
const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

const selectFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    handleFile(input.files[0]);
  }
};

const openFileSelector = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Handle drag and drop
const onDragEnter = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = true;
};

const onDrop = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;
  
  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
};

// Process the selected file
const handleFile = (file: File) => {
  // Check if it's a CSV file
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errorMessage.value = 'Please select a CSV file.';
    return;
  }
  
  selectedFile.value = file;
  fileName.value = file.name;
  successMessage.value = '';
  errorMessage.value = '';
};

// Upload the file
const uploadFile = async () => {
  if (!selectedFile.value) {
    errorMessage.value = 'Please select a file first.';
    return;
  }
  
  isUploading.value = true;
  uploadProgress.value = 25; // Start progress
  
  try {
    // Simulate progress (in a real app, you would track actual upload progress)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 15;
      }
    }, 500);
    
    const result = await transactionsStore.importTransactions(selectedFile.value);
    
    // Clear progress interval
    clearInterval(progressInterval);
    uploadProgress.value = 100;
    
    // Set success message
    successMessage.value = `Successfully imported ${result.count} transactions.`;
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    selectedFile.value = null;
    fileName.value = '';
    
    // Reset progress after a short delay
    setTimeout(() => {
      uploadProgress.value = 0;
      isUploading.value = false;
    }, 2000);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'An error occurred during import.';
    uploadProgress.value = 0;
    isUploading.value = false;
  }
};

// Clear selection
const clearFile = () => {
  selectedFile.value = null;
  fileName.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  successMessage.value = '';
  errorMessage.value = '';
};

const isReady = computed(() => !!selectedFile.value && !isUploading.value);
</script>

<template>
  <div class="import-transactions bg-white rounded-lg shadow-md p-6 dark:bg-gray-800 dark:text-white">
    <h2 class="text-xl font-bold mb-4">Import Transactions</h2>
    <p class="text-gray-600 mb-6 dark:text-gray-400">
      Upload a CSV file with your bank transactions to import them into the system.
      The CSV should contain columns for date, description, and amount at minimum.
    </p>
    
    <!-- File drop area -->
    <div 
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @dragover="onDragOver"
      @drop="onDrop"
      class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
      :class="{
        'border-blue-400 bg-blue-50': isDragging,
        'border-gray-300 hover:border-blue-400 hover:bg-blue-50': !isDragging
      }"
      @click="openFileSelector"
    >
      <input 
        ref="fileInput"
        type="file" 
        accept=".csv" 
        @change="selectFile"
        class="hidden"
      />
      
      <div v-if="!fileName">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p class="text-xs text-gray-500 mt-1 dark:text-gray-400">Only CSV files are supported</p>
      </div>
      
      <div v-else class="flex items-center justify-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-sm font-medium text-gray-900">{{ fileName }}</span>
        <button 
          type="button" 
          @click.stop="clearFile"
          class="text-red-600 hover:text-red-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Progress bar -->
    <div v-if="uploadProgress > 0" class="mt-4">
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-600 mt-1">{{ uploadProgress < 100 ? 'Importing...' : 'Import completed!' }}</p>
    </div>
    
    <!-- Messages -->
    <div v-if="successMessage" class="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
      {{ successMessage }}
    </div>
    
    <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
      {{ errorMessage }}
    </div>
    
    <!-- Action buttons -->
    <div class="mt-6 flex justify-end">
      <button 
        type="button" 
        @click="uploadFile"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        :disabled="!isReady"
      >
        Import Transactions
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.import-transactions {
  @apply max-w-2xl mx-auto;
}
</style> 