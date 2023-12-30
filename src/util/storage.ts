export namespace ExtensionStorage {
    export const enabled = storage.defineItem<boolean>(
        'local:enabled',
        {
          defaultValue: true,
        },
    );

    export const filterStrength = storage.defineItem<number>(
        'local:filterStrength',
        {
            defaultValue: 1, // 0 = weak, 1 = medium, 2 = strong
        },
    );
}