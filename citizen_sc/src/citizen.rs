#![no_std]
use multiversx_sc::imports::*;

const BLOCKS_IN_HOUR: u64 = 600;
const WOOD_REQUIRED: u64 = 10;
const FOOD_REQUIRED: u64 = 15;

#[multiversx_sc::contract]
pub trait Citizen {
    #[init]
    fn init(&self) {
    }

    #[upgrade]
    fn upgrade(&self) {}

    #[payable("*")]
    #[endpoint(mintCitizen)]
    fn mint_citizen(&self) {
        let (wood_amount, food_amount) = self.get_and_validate_resources();
        let caller = self.blockchain().get_caller();
        
        self.burn_resources(wood_amount, food_amount);
        
        let claim_block = self.blockchain().get_block_nonce() + BLOCKS_IN_HOUR;
        self.pending_claims(&caller).set(&claim_block);
    }

    #[endpoint(claimCitizen)]
    fn claim_citizen(&self) {
        let caller = self.blockchain().get_caller();
        require!(self.is_claim_ready(&caller), "Too early to claim");
        
        self.mint_and_send_nft(&caller);
        self.pending_claims(&caller).clear();
    }

    #[callback]
    fn citizen_token_callback(
        &self,
        #[call_result] result: ManagedAsyncCallResult<TokenIdentifier>
    ) {
        match result {
            ManagedAsyncCallResult::Ok(token_id) => {
                self.citizen_token_id().set(&token_id);
                self.next_nonce().set(&1u64);
            },
            ManagedAsyncCallResult::Err(_) => sc_panic!("Token issue failed")
        }
    }

    #[payable("EGLD")]
    #[endpoint(issue)]
    fn issue_citizen_token(&self, name: ManagedBuffer, ticker: ManagedBuffer) {
        let amount = self.call_value().egld_value();
        self.token_manager().issue_and_set_all_roles(EsdtTokenType::NonFungible, amount.clone_value(), name, ticker, 0, Some(self.callbacks().citizen_token_callback()));
    }

    fn get_and_validate_resources(&self) -> (BigUint, BigUint) {
        let mut wood = BigUint::zero();
        let mut food = BigUint::zero();
        
        for payment in self.call_value().all_esdt_transfers().iter() {
            let token_buffer = payment.token_identifier.as_managed_buffer();
            if token_buffer.len() >= 5 {
                let prefix = token_buffer.copy_slice(0, 5).unwrap();
                if prefix == ManagedBuffer::from(b"WOOD-") {
                    wood += &payment.amount;
                } else if prefix == ManagedBuffer::from(b"FOOD-") {
                    food += &payment.amount;
                } else {
                    sc_panic!("Invalid token");
                }
            } else {
                sc_panic!("Invalid token identifier length");
            }
        }
        
        require!(wood >= WOOD_REQUIRED, "Not enough WOOD");
        require!(food >= FOOD_REQUIRED, "Not enough FOOD");
        (wood, food)
    }
    
    fn burn_resources(&self, wood: BigUint, food: BigUint) {
        let payments = self.call_value().all_esdt_transfers();
        let mut wood_token_id = None;
        let mut food_token_id = None;
        
        for payment in payments.iter() {
            let token_buffer = payment.token_identifier.as_managed_buffer();
            if token_buffer.len() >= 5 {
                let prefix = token_buffer.copy_slice(0, 5).unwrap();
                if prefix == ManagedBuffer::from(b"WOOD-") {
                    wood_token_id = Some(payment.token_identifier.clone());
                } else if prefix == ManagedBuffer::from(b"FOOD-") {
                    food_token_id = Some(payment.token_identifier.clone());
                }
            }
        }
        
        if let Some(wood_id) = wood_token_id {
            self.send().esdt_local_burn(&wood_id, 0, &wood);
        }
        if let Some(food_id) = food_token_id {
            self.send().esdt_local_burn(&food_id, 0, &food);
        }
    }

    fn is_claim_ready(&self, caller: &ManagedAddress) -> bool {
        let claim_block = self.pending_claims(caller).get();
        self.blockchain().get_block_nonce() >= claim_block
    }

    fn mint_and_send_nft(&self, to: &ManagedAddress) {
        let nonce = self.next_nonce().get();
        
        self.send().esdt_nft_create(
            &self.citizen_token_id().get(),
            &BigUint::from(1u64),
            &ManagedBuffer::from(b"CITIZEN"),
            &BigUint::zero(),
            &ManagedBuffer::new(),
            &Empty,
            &ManagedVec::new(),
        );

        self.send().direct_esdt(
            to,
            &self.citizen_token_id().get(),
            nonce,
            &BigUint::from(1u64)
        );

        self.next_nonce().update(|val| *val += 1);
    }

    #[storage_mapper("citizenTokenId")]
    fn citizen_token_id(&self) -> SingleValueMapper<TokenIdentifier>;

    #[storage_mapper("ticker")]
    fn token_manager(&self) -> NonFungibleTokenMapper<Self::Api>;

    #[storage_mapper("nextNonce")]
    fn next_nonce(&self) -> SingleValueMapper<u64>;

    #[storage_mapper("pendingClaims")]
    fn pending_claims(&self, addr: &ManagedAddress) -> SingleValueMapper<u64>;
}