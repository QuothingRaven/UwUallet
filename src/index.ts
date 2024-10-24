import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { 
  GasPrice, 
  SigningStargateClient,
  StargateClient,
  QueryClient,
  setupStakingExtension,
  setupGovExtension,
  setupDistributionExtension
} from "@cosmjs/stargate";
import { stringToPath } from "@cosmjs/crypto";
import { Coin, coin } from "@cosmjs/amino";

class CosmosWallet {
  private wallet: DirectSecp256k1HdWallet | null = null;
  private client: SigningStargateClient | null = null;
  private queryClient: QueryClient | null = null;
  
  async createWallet(mnemonic?: string, prefix: string = "cosmos") {
    try {
      // Create or import wallet
      if (mnemonic) {
        this.wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
          prefix: prefix,
          hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
        });
      } else {
        this.wallet = await DirectSecp256k1HdWallet.generate(24, {
          prefix: prefix,
          hdPaths: [stringToPath("m/44'/118'/0'/0/0")],
        });
      }
      
      const [account] = await this.wallet.getAccounts();
      return {
        address: account.address,
        mnemonic: this.wallet.mnemonic,
        pubkey: account.pubkey
      };
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error}`);
    }
  }

  async connectToChain(rpcEndpoint: string) {
    try {
      if (!this.wallet) {
        throw new Error("Wallet not initialized");
      }
      
      // Set up signing client
      this.client = await SigningStargateClient.connectWithSigner(
        rpcEndpoint,
        this.wallet,
        { gasPrice: GasPrice.fromString("0.025uatom") }
      );
      
      // Set up query client with extensions
      const tmClient = await StargateClient.connect(rpcEndpoint);
      this.queryClient = QueryClient.withExtensions(
        tmClient,
        setupStakingExtension,
        setupGovExtension,
        setupDistributionExtension
      );
      
      return this.client;
    } catch (error) {
      throw new Error(`Failed to connect to chain: ${error}`);
    }
  }

  // Basic token operations
  async getBalance(address: string, denom: string = "uatom") {
    try {
      if (!this.client) throw new Error("Client not initialized");
      return await this.client.getBalance(address, denom);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  async sendTokens(
    recipientAddress: string,
    amount: string,
    denom: string = "uatom"
  ) {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [sender] = await this.wallet.getAccounts();
      return await this.client.sendTokens(
        sender.address,
        recipientAddress,
        [{ amount, denom }],
        {
          amount: [{ amount: "5000", denom: "uatom" }],
          gas: "200000",
        }
      );
    } catch (error) {
      throw new Error(`Failed to send tokens: ${error}`);
    }
  }

  // Staking operations
  async delegate(
    validatorAddress: string,
    amount: string,
    denom: string = "uatom"
  ) {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [delegator] = await this.wallet.getAccounts();
      return await this.client.delegateTokens(
        delegator.address,
        validatorAddress,
        coin(amount, denom),
        {
          amount: [{ amount: "5000", denom }],
          gas: "250000",
        }
      );
    } catch (error) {
      throw new Error(`Failed to delegate tokens: ${error}`);
    }
  }

  async undelegate(
    validatorAddress: string,
    amount: string,
    denom: string = "uatom"
  ) {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [delegator] = await this.wallet.getAccounts();
      return await this.client.undelegateTokens(
        delegator.address,
        validatorAddress,
        coin(amount, denom),
        {
          amount: [{ amount: "5000", denom }],
          gas: "250000",
        }
      );
    } catch (error) {
      throw new Error(`Failed to undelegate tokens: ${error}`);
    }
  }

  async redelegate(
    sourceValidatorAddress: string,
    destinationValidatorAddress: string,
    amount: string,
    denom: string = "uatom"
  ) {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [delegator] = await this.wallet.getAccounts();
      return await this.client.beginRedelegate(
        delegator.address,
        sourceValidatorAddress,
        destinationValidatorAddress,
        coin(amount, denom),
        {
          amount: [{ amount: "5000", denom }],
          gas: "250000",
        }
      );
    } catch (error) {
      throw new Error(`Failed to redelegate tokens: ${error}`);
    }
  }

  async getRewards(validatorAddress?: string) {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [delegator] = await this.wallet.getAccounts();
      return await this.client.withdrawRewards(
        delegator.address,
        validatorAddress || "",
        {
          amount: [{ amount: "5000", denom: "uatom" }],
          gas: "250000",
        }
      );
    } catch (error) {
      throw new Error(`Failed to get rewards: ${error}`);
    }
  }

  // Governance operations
  async submitProposal(
    title: string,
    description: string,
    initialDeposit: Coin[]
  ) {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [proposer] = await this.wallet.getAccounts();
      return await this.client.submitProposal({
        type: "cosmos-sdk/TextProposal",
        value: {
          title,
          description,
        },
        initialDeposit,
        proposer: proposer.address,
      });
    } catch (error) {
      throw new Error(`Failed to submit proposal: ${error}`);
    }
  }

  async vote(proposalId: number, option: 'Yes' | 'No' | 'NoWithVeto' | 'Abstain') {
    try {
      if (!this.client || !this.wallet) {
        throw new Error("Wallet or client not initialized");
      }
      
      const [voter] = await this.wallet.getAccounts();
      return await this.client.vote(
        voter.address,
        proposalId,
        option,
        {
          amount: [{ amount: "5000", denom: "uatom" }],
          gas: "200000",
        }
      );
    } catch (error) {
      throw new Error(`Failed to vote: ${error}`);
    }
  }

  // Query methods
  async getValidators() {
    try {
      if (!this.queryClient) throw new Error("Query client not initialized");
      return await this.queryClient.staking.validators("BOND_STATUS_BONDED");
    } catch (error) {
      throw new Error(`Failed to get validators: ${error}`);
    }
  }

  async getProposals() {
    try {
      if (!this.queryClient) throw new Error("Query client not initialized");
      return await this.queryClient.gov.proposals();
    } catch (error) {
      throw new Error(`Failed to get proposals: ${error}`);
    }
  }
}

export default CosmosWallet;
