// Code generated by the multiversx-sc build system. DO NOT EDIT.

////////////////////////////////////////////////////
////////////////// AUTO-GENERATED //////////////////
////////////////////////////////////////////////////

// Init:                                 1
// Upgrade:                              1
// Endpoints:                            7
// Async Callback:                       1
// Total number of exported functions:  10

#![no_std]

multiversx_sc_wasm_adapter::allocator!();
multiversx_sc_wasm_adapter::panic_handler!();

multiversx_sc_wasm_adapter::endpoints! {
    snow
    (
        init => init
        upgrade => upgrade
        issueTokenSnow => issue_token
        burnTokens => burn_tokens
        getAllUsersTokens => get_all_user_tokens
        getAllUserTokenBalances => get_all_user_token_balances
        getSingleTokenBalance => get_single_token_balance
        claimUserTokens => claim_user_tokens
        claimTokens => claim_tokens
    )
}

multiversx_sc_wasm_adapter::async_callback! { snow }
