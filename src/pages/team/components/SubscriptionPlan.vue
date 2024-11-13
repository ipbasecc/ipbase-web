<template>
  <div class="q-pa-md">
    <div class="text-h5 text-center">Subscription Plans</div>
    <div class="row q-mt-md">
      <div class="col-12 col-md-6">
        <div class="text-h6">Basic Features</div>
        <div class="q-mt-md">
          <q-card class="q-mb-md" v-for="plan in plans" :key="plan.name">
            <q-card-section>
              <div class="text-h6">{{ plan.name }}</div>
              <div class="text-subtitle2">{{ plan.description }}</div>
              <q-list dense>
                <q-item v-for="feature in features" :key="feature.name">
                  <q-item-section>
                    {{ feature.name }}
                  </q-item-section>
                  <q-item-section side>
                    <q-icon :name="plan.features.includes(feature.name) ? 'check' : 'close'" />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-btn color="primary" label="Buy Now" />
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="text-h6">Advanced Features</div>
        <div class="q-mt-md">
          <q-card class="q-mb-md" v-for="plan in plans" :key="plan.name">
            <q-card-section>
              <div class="text-h6">{{ plan.name }}</div>
              <div class="text-subtitle2">{{ plan.description }}</div>
              <q-list dense>
                <q-item v-for="feature in advancedFeatures" :key="feature.name">
                  <q-item-section>
                    {{ feature.name }}
                  </q-item-section>
                  <q-item-section side>
                    <q-icon :name="plan.features.includes(feature.name) ? 'check' : 'close'" />
                  </q-item-section>
                </q-item>
              </q-list>
              <q-btn color="primary" label="Buy Now" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <div class="text-center q-mt-md">
      <q-btn color="primary" icon="star" label="Recommended: Professional Plan" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const plans = ref([
  { name: 'Regular', description: 'For small teams', features: ['Basic Support', 'Limited Storage', 'Standard Security', 'Enhanced Collaboration', 'Customizable Dashboard'] },
  { name: 'Professional', description: 'For growing teams', features: ['Priority Support', 'Extended Storage', 'Advanced Security', 'Advanced Collaboration', 'Advanced Dashboard', 'Standard Analytics'] },
  { name: 'Enterprise', description: 'For large teams', features: ['All Support', 'Unlimited Storage', 'Maximum Security', 'All Collaboration', 'All Dashboard', 'Advanced Analytics'] },
]);

const features = ref([
  { name: 'Basic Support' },
  { name: 'Limited Storage' },
  { name: 'Standard Security' },
  { name: 'Priority Support' },
  { name: 'Extended Storage' },
  { name: 'Advanced Security' },
]);

const advancedFeatures = ref([
  { name: 'Enhanced Collaboration' },
  { name: 'Customizable Dashboard' },
  { name: 'Basic Analytics' },
  { name: 'Advanced Collaboration' },
  { name: 'Advanced Dashboard' },
  { name: 'Standard Analytics' },
  { name: 'All Collaboration' },
  { name: 'All Dashboard' },
  { name: 'Advanced Analytics' },
]);
</script>

<style scoped>
.q-card {
  width: 100%;
}
</style>

