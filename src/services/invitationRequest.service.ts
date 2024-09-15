import { FindOneOptions, Repository } from "typeorm";
import { AppDataSource } from "../database/dataSource";
import {
  InvitationRequest,
  InvitationRequestStatus,
} from "../database/entity/InvitationRequest.entity";
import { User } from "../database/entity/User.entity";
import { Restaurant } from "../database/entity/Restaurant.entity";

export class InvitationRequestService {
  invitationRequestRepository: Repository<InvitationRequest>;

  constructor() {
    this.invitationRequestRepository =
      AppDataSource.getRepository(InvitationRequest);
  }

  // Create a new invitation request
  public createInvitationRequest(
    inviteFrom: User,
    inviteTo: User,
    restaurant: Restaurant,
    invitationStatus: InvitationRequestStatus = InvitationRequestStatus.AWAITING
  ): InvitationRequest {
    const newInvitation = this.invitationRequestRepository.create({
      inviteFrom,
      inviteTo,
      restaurant,
      invitationStatus,
    });

    return newInvitation;
  }

  // Save an invitation request to the database
  public async saveRequest(invitationRequest: InvitationRequest) {
    return await this.invitationRequestRepository.save(invitationRequest);
  }

  // Read all invitation requests
  public async getAllRequests(
    restaurant: Restaurant
  ): Promise<InvitationRequest[]> {
    return await this.invitationRequestRepository.find({ where: restaurant });
  }

  // Read a single invitation request by ID
  public async getRequestById(id: number): Promise<InvitationRequest | null> {
    return await this.invitationRequestRepository.findOne({
      where: { id },
    });
  }

  public async getRequestByInvitedUsername(
    inviteTo: User,
    isAwaiting: boolean = null
  ): Promise<InvitationRequest | null> {
    const whereQuery: Partial<InvitationRequest> = { inviteTo };

    if (isAwaiting === true) {
      whereQuery.invitationStatus = InvitationRequestStatus.AWAITING;
    }

    return await this.invitationRequestRepository.findOne({
      where: whereQuery,
    });
  }

  // Update an existing invitation request
  public async updateRequest(
    id: number,
    updateData: Partial<InvitationRequest>
  ): Promise<InvitationRequest | null> {
    const invitationRequest = await this.getRequestById(id);
    if (!invitationRequest) {
      return null;
    }

    // Update only the fields that are provided in updateData
    Object.assign(invitationRequest, updateData);

    return await this.invitationRequestRepository.save(invitationRequest);
  }
}
