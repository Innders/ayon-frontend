import { ayonApi, buildOperations } from '../ayon'
import { updateNodes } from '/src/features/editor'

const updateEntity = ayonApi.injectEndpoints({
  endpoints: (build) => ({
    updateEntitiesDetails: build.mutation({
      query: ({ projectName, type, patches, data, ids }) => ({
        url: `/api/projects/${projectName}/operations`,
        method: 'POST',
        body: {
          operations: buildOperations(ids || patches.map((p) => p.id), type, data),
        },
      }),
      async onQueryStarted({ projectName, type, patches, data }, { dispatch, queryFulfilled }) {
        if (!patches) return

        const patchResult = dispatch(
          ayonApi.util.updateQueryData(
            'getEntitiesDetails',
            { projectName, ids: patches.map((p) => p.id), type },
            (draft) => {
              Object.assign(
                draft,
                patches.map((p) => ({ node: p })),
              )
            },
          ),
        )

        // update editor
        const editorPatch = dispatch(
          updateNodes({ updated: patches.map((p) => ({ id: p.id, ...data })) }),
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
          editorPatch.undo()
        }
      },
    }),
  }),
})

export const { useUpdateEntitiesDetailsMutation } = updateEntity
