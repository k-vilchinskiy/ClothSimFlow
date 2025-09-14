WGSL stubs for future GPU compute pipelines.

Files to add next:
- pd_predict.wgsl               // Predict positions from velocities
- pd_local_projections.wgsl     // Stretch/shear/bend and barrier projections
- pd_global_modal.wgsl          // Modal warm start / reuse
- pd_global_ajacobi.wgsl        // Aggregated Jacobi iterations
- collide_bvh.wgsl              // BVH traversal for narrow/broad phase
- collide_partial_ccd.wgsl      // Partial CCD sampling
- collide_full_ccd.wgsl         // Full CCD + line search
- residual_forwarding.wgsl      // Residual estimation

Each file should define entry points and buffer bindings consistent
with Sim.Buffers / Sim.Params described in TASK.md.

